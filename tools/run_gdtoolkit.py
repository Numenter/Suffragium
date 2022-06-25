#!/usr/bin/env python3
"""This Script runs gdformat and gdlint on all files in game folder.
https://github.com/Scony/godot-gdscript-toolkit
"""
import sys
import argparse
import subprocess


def main() -> int | str | None:
	"""Execute gdformat and gdlint and return whether there was an error."""
	parser = argparse.ArgumentParser(
		description="This Script runs gdformat and gdlint on all files in game folder",
		formatter_class=argparse.ArgumentDefaultsHelpFormatter
	)
	parser.add_argument(
		"-d", "--diff", action="store_true",
		help="Don't write the files back, just suggest formattting changes"
	)
	parser.add_argument(
		"-s", "--skip", action="store_true",
		help="Skip the pause at the end on windows"
	)					
	args = parser.parse_args()
	config = vars(args)

	if sys.version_info < (3, 4):
		return "Please upgrade your Python version to 3.5.0 or higher"

	game_path = "../game/"
	try:
		parameters = ["gdformat", game_path]
		if config.get("diff"):
			parameters.append("-d")
		resp  = subprocess.run(parameters, capture_output=True, check=False)
		print("--- Format ---")
		print(resp.stdout.decode("utf-8").strip())
		print()
		resp2 = subprocess.run(["gdlint", game_path], capture_output=True, check=False)
		print("--- Lint ---")
		print(resp2.stdout.decode("utf-8").strip())

		if sys.platform == "win32" and not config.get("skip"):
			print()
			input("Press Enter to close.")
		
		return resp.returncode or resp2.returncode

	except OSError:
		return "ERROR: GDScript Toolkit not installed!"

	return "ERROR: reached unreachable code!"


if __name__ == "__main__":
     sys.exit(main())
