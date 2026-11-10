import unittest
import urllib.error
from wait_pages_artifact import wait_for_artifact


class ArtifactVisibilityTests(unittest.TestCase):
    def setUp(self):
        self.name = 'github-pages-42-2'
        self.good = {'id': 123, 'name': self.name, 'expired': False}
        self.sleep_calls = []

    def wait(self, responses, attempts=12):
        stream = iter(responses)
        def fetch():
            item = next(stream)
            if isinstance(item, Exception):
                raise item
            return item
        return wait_for_artifact(fetch, self.name, 123, attempts=attempts,
                                 interval=5, sleep=self.sleep_calls.append, log=lambda _: None)

    def test_delayed_metadata_and_previous_attempt_are_not_deployed(self):
        old = {**self.good, 'id': 100, 'name': 'github-pages-42-1'}
        result = self.wait([[], [old], [self.good], [self.good], [self.good]])
        self.assertEqual(result, self.good)
        self.assertEqual(self.sleep_calls, [5, 5, 5, 5])

    def test_visibility_must_remain_stable(self):
        self.wait([[self.good], [], [self.good], [self.good], [self.good]])
        self.assertEqual(len(self.sleep_calls), 4)

    def test_transient_api_failure_is_retried(self):
        error = urllib.error.HTTPError('https://api.github.com', 503, 'Unavailable', {}, None)
        self.wait([error, [self.good], [self.good], [self.good]])
        self.assertEqual(len(self.sleep_calls), 3)

    def test_wrong_id_expired_and_duplicate_packages_do_not_pass(self):
        for response in [[{**self.good, 'id': 999}], [{**self.good, 'expired': True}],
                         [self.good, {**self.good, 'id': 999}]]:
            with self.subTest(response=response), self.assertRaises(RuntimeError):
                self.wait([response] * 3, attempts=3)

    def test_authorization_failure_is_reported_without_retry(self):
        error = urllib.error.HTTPError('https://api.github.com', 403, 'Forbidden', {}, None)
        with self.assertRaises(urllib.error.HTTPError):
            self.wait([error])
        self.assertEqual(self.sleep_calls, [])


if __name__ == '__main__':
    unittest.main()
