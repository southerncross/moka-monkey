import { Action, Project } from '../type';
import { applyForAllRepos } from '../util';

async function approveRepo({ repoId, mrId }: Project) {
  const res = await fetch(
    `https://gitlab.mokahr.com/api/v4/projects/${repoId}/merge_requests/${mrId}/approve`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token":
          "xXlbCyiAd5Z2ZisFYqlavuoCn/f1wBPZdCOV/q+L7hKPlvFXRG9Vg9BRjM4GzUE8CwNlp/ibI6FRm4IEV0CTjw==",
        "x-requested-with": "XMLHttpRequest",
      },
      body: null,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Approve failed: ${await res.text()}`);
  }

  return true;
}

export const action: Action = {
  title: '合并所有merge到release的MR',
  callback: approveRepo,
};
