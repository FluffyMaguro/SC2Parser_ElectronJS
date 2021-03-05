"""
This script makes packaging with Pyinstaller easier
Run the pyinstaller, cleans up, zips files.

"""

import os
import shutil

# Clear old dist
if os.path.isdir('src/ReplayAnalysis'):
    shutil.rmtree('src/ReplayAnalysis')


# Clear __pycache__ from s2protocol folders
cache_folders = set()
for root, directories, files in os.walk(os.getcwd()):
    for directory in directories:
        if directory == '__pycache__':
            dir_path = os.path.join(root,directory)
            if 's2protocol' in root:
                print(f'Removing: {dir_path}')
                shutil.rmtree(dir_path)


# Run pyinstaller --noconsole
os.system('cmd /c "pyinstaller.exe --add-data venv\Lib\site-packages\s2protocol;s2protocol --add-data parser\SC2Dictionaries\*.csv;SC2Dictionaries --add-data parser\SC2Dictionaries\*.txt;SC2Dictionaries parser\ReplayAnalysis.py"')

# Remove build
os.remove('ReplayAnalysis.spec')

shutil.move('dist/ReplayAnalysis','src/ReplayAnalysis')
shutil.rmtree('build')
shutil.rmtree('dist')