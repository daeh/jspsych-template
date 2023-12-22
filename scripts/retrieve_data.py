import argparse
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
import json
from typing import NamedTuple
import subprocess
import time


class FirestoreEncoder(json.JSONEncoder):
    def default(self, obj):
        # Check if the object is an instance of Firestore's datetime type
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        return super(FirestoreEncoder, self).default(obj)


def load_creds(relpath: str):
    cred_archive = Path("~/Documents/api_credentials.sparsebundle").expanduser()
    cred_file = Path("/Volumes/creds/") / relpath
    assert cred_archive.exists(), f"Sparsebundle does not exist at {cred_archive}"  # pathlib thinks that sparsebundles are directories, not files
    assert cred_file.suffix == ".json", f"File {cred_file} does not have .json suffix"
    if not cred_file.parent.is_dir():
        clout = subprocess.run(["open", str(cred_archive)], encoding="utf-8", check=True)
        assert clout.returncode == 0
        timeout = 10  # seconds
        delay = 0.5
        while not cred_file.parent.is_dir():
            time.sleep(delay)
            timeout -= delay
            assert timeout > 0, f"Timed out waiting for {cred_file.parent} to be mounted"
    assert cred_file.is_file(), f"File {cred_file} does not exist"
    with open(cred_file, "r", encoding="utf-8") as f:
        contents = json.load(f)
    Cred = NamedTuple("Cred", data=dict[str, str], path=str)
    return Cred(contents, str(cred_file))


def authorize(credpath: str, encrypted=False):

    if encrypted:
        credential = load_creds(credpath)
        cred_path = credential.path
    else:
        cred_path = Path(credpath).expanduser()
        if not cred_path.is_absolute():
            cred_path = (Path(__file__).parent / cred_path).resolve()

    assert Path(cred_path).is_file(), f"File {cred_path} does not exist"

    cred = credentials.Certificate(cred_path)

    firebase_admin.initialize_app(cred)

    return firestore.client()


def getdata(credpath: str, exportpath: str, collections: list[str], encrypted: bool = False):

    export_path = Path(exportpath).expanduser()
    if not export_path.is_absolute():
        export_path = (Path(__file__).parent / export_path).absolute()

    if export_path.exists():
        raise Exception(f"Path {export_path} already exists. Aborting to prevent overwriting data.")

    export_path.mkdir(parents=True, exist_ok=True)

    db = authorize(credpath, encrypted)

    for collection_name in collections:

        docs = db.collection(collection_name).stream()

        data = {doc.id: doc.to_dict() for doc in docs}

        data_path = export_path / f"{collection_name}.json"

        with open(data_path, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, cls=FirestoreEncoder, indent=2)


def _cli():
    """Retrieve data from Firestore and save it locally.
    """
    parser = argparse.ArgumentParser(
        prog="Data Retriever",
        description=__doc__,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        # argument_default=argparse.SUPPRESS
        # epilog="Text at the bottom of help"
    )
    parser.add_argument("--cred", dest="credpath", required=True, help="Path to Firebase credentials JSON file")
    parser.add_argument("--out", dest="exportpath", required=True, help="Output directory path")
    parser.add_argument("--collection", dest="collections", nargs="+", required=True, help="Name of the Firestore collections to retrieve")
    parser.add_argument("--encrypted", action="store_true", help="Specify if the credentials file is stored in an encrypted sparseimage")
    args = parser.parse_args()
    return vars(args)


def main(credpath: str, exportpath: str, collections: list[str], encrypted: bool = False):

    getdata(credpath=credpath, exportpath=exportpath, collections=collections, encrypted=encrypted)


if __name__ == "__main__":
    main(**_cli())
