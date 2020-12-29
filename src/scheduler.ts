import { Action } from './type';

async function fetchRepoInfo(repoName: string): Promise<{ repoId: string; groupName: string }> {
  const groupNames = ['TryMoka', 'ats-client'];

  for (const groupName of groupNames) {
    const res = await fetch(
      `https://gitlab.mokahr.com/${groupName}/${repoName}`
    );
    if (res.status === 404) {
      continue;
    }

    const html = document.createElement('html');
    html.innerHTML = await res.text();

    let repoId = '';

    const $project = html.querySelector('.home-panel-metadata .text-secondary');
    
    if ($project) {
      repoId = ($project as HTMLElement).innerText.trim()
      .match(/^Project ID: (\w+)$/)[1] || '';
    }
      
    return { repoId, groupName };
  }

  return null;
}

async function findMrId({
  groupName,
  repoName,
  search = 'merge gray-release to release',
}: {
  groupName: string;
  repoName: string;
  search?: string;
}): Promise<string> {
  const convertedSearch = search
    .split(' ')
    .map((seg) => encodeURIComponent(seg))
    .join('+');
  const html = document.createElement('html');
  html.innerHTML = await fetch(
    `https://gitlab.mokahr.com/${groupName}/${repoName}/merge_requests?state=opened&search=${convertedSearch}`
  ).then((res) => res.text());

  const mrItem = html.querySelector('li.merge-request .issuable-reference');
  if (!mrItem) {
    throw new Error(`Can not found MR of "${search}"`);
  }

  const mrId = (mrItem as HTMLElement).innerText.trim().match(/^!(\d+)$/)[1] || '';
  return mrId;
}

async function applyForAllRepos(repoNames: string[], action: Action) {
  const results: { repoName: string; url: string; status: string }[] = [];
  for (const repoName of repoNames) {
    const result = { repoName: '', url: '', status: '' };
    try {
      const { repoId, groupName } = await fetchRepoInfo(repoName);
      result.repoName = repoName;
      const mrId = await findMrId({ groupName, repoName });
      result.url = `https://gitlab.mokahr.com/${groupName}/${repoName}/merge_requests/${mrId}`;
      // await action.callback({ repoId, mrId });
      result.status = `${action.title} done`;
    } catch (e) {
      result.status = e.message;
    }
    results.push(result);
  }

  console.table(results);
}

export { applyForAllRepos };
