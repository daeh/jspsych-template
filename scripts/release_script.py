import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional, Union

# Set the environment variable for colored output
os.environ["FORCE_COLOR"] = "1"


def run_command(
    cmd: Union[list[str], str],
    cwd: Optional[Path] = None,
    timeout: Optional[int] = None,
    silent: bool = False,
) -> str:
    """
    Executes a shell command and returns its output.

    Args:
        cmd (Union[list[str], str]): The command to execute.
        cwd (Optional[Path], optional): The working directory. Defaults to None.
        timeout (Optional[int], optional): Timeout in seconds. Defaults to None.
        silent (bool, optional): If True, suppresses output. Defaults to False.

    Raises:
        RuntimeError: If the command execution fails.

    Returns:
        str: The standard output from the command.
    """
    if not silent:
        print(f"Running command: {cmd}")
    try:
        shell = isinstance(cmd, str)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
            cwd=cwd,
            shell=shell,
            timeout=timeout,
        )
        if not silent:
            print(result.stdout)
            if result.stderr:
                print("\n--ERROR--\n")
                print(result.stderr)
                print("\n-------\n")
        if result.returncode != 0:
            raise RuntimeError(f"Command failed with error: {result.stderr}")
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Command failed with error: {e.stderr}")


def get_version(project_path: Path) -> str:
    """Retrieves the current version from package.json."""
    package_json_path = project_path / "package.json"
    with package_json_path.open("r", encoding="utf-8") as f:
        package_json = json.load(f)
    return package_json["version"]


def update_package_json_version(new_version: str, project_dir: Path) -> None:
    """Updates the version number in package.json."""
    package_json_path = project_dir / "package.json"
    with package_json_path.open("r", encoding="utf-8") as f:
        package_json = json.load(f)
    package_json["version"] = new_version
    with package_json_path.open("w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2)
        f.write("\n")


def attempt_release(project_path: Path) -> None:
    try:
        # Get the current version
        current_version = get_version(project_path)
        print("\n" + "-" * 61)
        print(f"Current Version: {current_version}")
        print("-" * 61 + "\n")
        new_version = current_version
        git_porcelain = False
        tag = False

        # Check Git status
        git_status_output = run_command(
            ["git", "status", "--porcelain"], cwd=project_path, silent=True
        )
        if git_status_output == "":
            git_porcelain = True
            print("-" * 61)
            print("Git Repo is up to date, moving on...")
            print("-" * 61 + "\n")
        else:
            print("\n" + "-" * 61 + "\n")
            while True:
                increment_version = input(
                    ">>> Do you want to increment the version number? ( yes [y], no [n], exit [x] ):  "
                ).strip().lower()
                if increment_version in ["c", "x", "q"]:
                    sys.exit(0)
                elif increment_version in ["y", "yes"]:
                    new_version = input(">>> Enter the new version number:  ").strip()
                    if re.match(r"^[0-9]+\.[0-9]+\.[0-9]+$", new_version):
                        update_package_json_version(new_version, project_path)
                        tag = True
                        print("\n" + "-" * 61)
                        print("Version update completed successfully.")
                        print("-" * 61 + "\n")
                        break
                    else:
                        print("\nInvalid version format. Version was not incremented.\n")
                        sys.exit(1)
                elif increment_version in ["n", "no"]:
                    break
                else:
                    print(
                        "Invalid input. Please enter yes [y], no [n], or exit [x].\n"
                    )

        # Linting
        print("\n" + "-" * 61)
        print("Linting...")
        print("-" * 61 + "\n")
        hosting_path = project_path / "hosting"
        run_command(["yarn", "lint:prod"], cwd=hosting_path)

        if git_porcelain:
            print("\n" + "-" * 61)
            print("No changes to commit.")
            print("-" * 61 + "\n")
        else:
            print("\n" + "-" * 61)
            print("Modified files:")
            print("-" * 61 + "\n")
            run_command(["git", "status", "--porcelain"], cwd=project_path)
            print("\n---\n")
            run_command(["git", "status"], cwd=project_path)
            input(
                "\n>>> Modified files shown above\n>>> Press Enter to continue to the commit process, or Ctrl+C to abort.\n"
            )
            run_command(["git", "add", "."], cwd=project_path)
            print("\n" + "-" * 61)
            print("Changes to be committed:")
            print("-" * 61 + "\n")
            env = os.environ.copy()
            env["GIT_PAGER"] = "cat"
            subprocess.run(
                ["git", "diff", "--cached"], cwd=project_path, env=env, check=True
            )
            input(
                "\n>>> Diffs shown above\n>>> Press Enter to continue to the commit process, or Ctrl+C to abort.\n"
            )
            print("\n" + "-" * 61)
            print("Starting Git commit process...")
            print("-" * 61 + "\n")
            commit_msg = input(">>> Enter your commit message:  ")
            run_command(["git", "commit", "-m", commit_msg], cwd=project_path)

        if tag:
            print("\n" + "-" * 61 + "\n")
            while True:
                tag_commit = input(
                    ">>> Do you want to TAG this commit with the version number? ( yes [y], no [n], exit [x] ):  "
                ).strip().lower()
                if tag_commit in ["c", "x", "q"]:
                    sys.exit(0)
                elif tag_commit in ["y", "yes"]:
                    run_command(
                        [
                            "git",
                            "tag",
                            "-a",
                            f"v{new_version}",
                            "-m",
                            f"Version {new_version}",
                        ],
                        cwd=project_path,
                    )
                    print("\n" + "-" * 61)
                    print(f"Tag v{new_version} added.")
                    print("-" * 61 + "\n")
                    break
                elif tag_commit in ["n", "no"]:
                    break
                else:
                    print(
                        "Invalid input. Please enter yes [y], no [n], or exit [x].\n"
                    )

        # Build the project
        print("\n" + "-" * 61)
        print("Building project...")
        print("-" * 61 + "\n")
        run_command(["yarn", "build:prod"], cwd=hosting_path)

        # Deploy the project
        print("\n" + "-" * 61)
        print("Deploying project...")
        print("-" * 61 + "\n")
        run_command(["yarn", "deploy-rules"], cwd=project_path)
        run_command(["yarn", "deploy"], cwd=project_path)

        print("\n" + "-" * 61)
        print("Script completed successfully.")
        print("-" * 61 + "\n")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Release script")
    parser.add_argument("project_path", type=str, help="Path to the project directory")
    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()
    if not project_path.is_dir():
        print(f"Error: Project path {project_path} is not a directory.")
        sys.exit(1)

    attempt_release(project_path)


if __name__ == "__main__":
    main()
