# This Script runs gdformat and gdlint on all files in game folder.
# https://github.com/Scony/godot-gdscript-toolkit
import sys
import subprocess

if sys.version_info < (3, 4):
    print('Please upgrade your Python version to 3.4.0 or higher')
    sys.exit()

game_path = "../game/"
try:
    re = subprocess.run(["gdformat", str(game_path)], capture_output=True)
    print("--- Format ---")
    print(re.stdout)
    print()
    re = subprocess.run(["gdlint", str(game_path)], capture_output=True)
    print("--- Lint ---")
    print(re.stdout)
except OSError:
    wait = input("ERROR: GDScript Toolkit not installed!")
    sys.exit()

print()
wait = input("Press Enter to close.")
