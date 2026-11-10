"""Wait for the exact uploaded Pages package to become consistently visible."""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request


def wait_for_artifact(fetch, artifact_name, artifact_id, *, attempts=24, interval=5,
                      sleep=time.sleep, log=print):
    stable = 0
    for attempt in range(attempts):
        try:
            artifacts = fetch()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504):
                raise
            artifacts = []
            log(f'Artifact metadata temporarily unavailable (HTTP {error.code}).')
        except (urllib.error.URLError, TimeoutError):
            artifacts = []
            log('Artifact metadata request interrupted; retrying.')
        matches = [item for item in artifacts if item.get('name') == artifact_name]
        ready = (len(matches) == 1 and not matches[0].get('expired', False)
                 and str(matches[0].get('id')) == str(artifact_id))
        stable = stable + 1 if ready else 0
        if stable >= 3:
            log(f'Pages artifact verified: {artifact_name} (ID {artifact_id}).')
            return matches[0]
        log(f'Waiting for Pages artifact metadata ({attempt + 1}/{attempts}; stable {stable}/3).')
        if attempt + 1 < attempts:
            sleep(interval)
    raise RuntimeError('Uploaded Pages package did not become uniquely visible in time; deployment stopped before selecting an incorrect package.')


def main():
    name = os.environ['PAGES_ARTIFACT_NAME']
    artifact_id = os.environ['PAGES_ARTIFACT_ID']
    if not artifact_id.isdigit():
        raise RuntimeError('The Pages upload did not return a valid artifact ID.')
    query = urllib.parse.urlencode({'name': name, 'per_page': 100})
    url = (os.environ.get('GITHUB_API_URL', 'https://api.github.com').rstrip('/')
           + '/repos/' + os.environ['GITHUB_REPOSITORY'] + '/actions/runs/'
           + os.environ['GITHUB_RUN_ID'] + '/artifacts?' + query)
    headers = {'Authorization': 'Bearer ' + os.environ['GH_TOKEN'],
               'Accept': 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28', 'Cache-Control': 'no-cache'}

    def fetch():
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)['artifacts']

    wait_for_artifact(fetch, name, artifact_id)


if __name__ == '__main__':
    main()
