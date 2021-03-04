import os
import sys
import json
import mpyq
from s2protocol import versions
from s2protocol.build import game_version as protocol_build

valid_protocols = {81102: 81433, 80871: 81433, 76811: 76114, 80188: 78285, 79998: 78285, 81433: 82457, 82893: 82457, 83830: 81433}

protocols = [
    15405, 16561, 16605, 16755, 16939, 17266, 17326, 18092, 18468, 18574, 19132, 19458, 19595, 19679, 21029, 22612, 23260, 24944, 26490, 27950, 28272,
    28667, 32283, 51702, 52910, 53644, 54518, 55505, 55958, 56787, 57507, 58400, 59587, 60196, 60321, 62347, 62848, 63454, 64469, 65094, 65384, 65895,
    66668, 67188, 67926, 69232, 70154, 71061, 71523, 71663, 72282, 73286, 73559, 73620, 74071, 74456, 74741, 75025, 75689, 75800, 76052, 76114, 77379,
    77535, 77661, 78285, 80669, 80949, 81009, 81433
]

def parse(file):
    if not os.path.isfile(file):
        print('ERROR: Not a file!')
        return None,None,None,None

    # Open archive
    archive = mpyq.MPQArchive(file)
    contents = archive.header['user_data_header']['content']

    header = versions.latest().decode_replay_header(contents)
    replay_build = header['m_version']['m_baseBuild']

    # If the build is in a known list of protocols that aren't included but work, replace the build by the version that works.
    base_build = valid_protocols.get(replay_build, replay_build)

    try:
        protocol = versions.build(base_build)
        used_build = base_build
            
    except:
        protocol = versions.latest()
        used_build = protocol_build().split('.')[-2]

    # Get player info
    player_info = archive.read_file('replay.details')
    player_info = protocol.decode_replay_details(player_info)

    # Get detailed info
    detailed_info = archive.read_file('replay.initData')
    detailed_info = protocol.decode_replay_initdata(detailed_info)

    # Get metadata
    metadata = json.loads(archive.read_file('replay.gamemetadata.json'))

    # Messages
    messages = archive.read_file('replay.message.events')
    messages = list(protocol.decode_replay_message_events(messages))

    # Get game events
    game_events = archive.read_file('replay.game.events')
    game_events = protocol.decode_replay_game_events(game_events)

    # Get tracker events
    tracker_events = archive.read_file('replay.tracker.events')
    tracker_events = protocol.decode_replay_tracker_events(tracker_events)

    # Merge them together
    events = list(game_events) + list(tracker_events)
    events = sorted(events, key=lambda x: x['_gameloop'])

    return events, player_info, detailed_info, messages


if __name__ == '__main__':
    if len(sys.argv) > 1:
        file = sys.argv[1]
        events, player_info, detailed_info, messages = parse(file)
        print(messages)
    else:
        print('ERROR: Add arguments!')