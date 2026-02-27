from src.snapshots import check_snapshot


def test_snapshot_update_and_match(tmp_path):
    snapshot = tmp_path / "report.md"
    ok, message = check_snapshot("hello", snapshot, update=True)
    assert ok
    assert message == "snapshot updated"

    ok, message = check_snapshot("hello", snapshot)
    assert ok
    assert message == "snapshot match"

    ok, message = check_snapshot("different", snapshot)
    assert not ok
    assert message == "snapshot mismatch"
