// ==UserScript==
// @name         Moka Monkey
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://gitlab.mokahr.com/
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  async function fetchRepoInfo(repoName) {
    const groupNames = ['TryMoka', 'ats-client'];

    for (const groupName of groupNames) {
      const res = await fetch(`https://gitlab.mokahr.com/${groupName}/${repoName}`);

      if (res.status === 404) {
        continue;
      }

      const html = document.createElement('html');
      html.innerHTML = await res.text();
      let repoId = '';
      const $project = html.querySelector('.home-panel-metadata .text-secondary');

      if ($project) {
        repoId = $project.innerText.trim().match(/^Project ID: (\w+)$/)[1] || '';
      }

      return {
        repoId,
        groupName
      };
    }

    return null;
  }

  async function findMrId({
    groupName,
    repoName,
    search = 'merge gray-release to release'
  }) {
    const convertedSearch = search.split(' ').map(seg => encodeURIComponent(seg)).join('+');
    const html = document.createElement('html');
    html.innerHTML = await fetch(`https://gitlab.mokahr.com/${groupName}/${repoName}/merge_requests?state=opened&search=${convertedSearch}`).then(res => res.text());
    const mrItem = html.querySelector('li.merge-request .issuable-reference');

    if (!mrItem) {
      throw new Error(`Can not found MR of "${search}"`);
    }

    const mrId = mrItem.innerText.trim().match(/^!(\d+)$/)[1] || '';
    return mrId;
  }

  async function applyForAllRepos(repoNames, action) {
    const results = [];

    for (const repoName of repoNames) {
      const result = {
        repoName: '',
        url: '',
        status: ''
      };

      try {
        const {
          repoId,
          groupName
        } = await fetchRepoInfo(repoName);
        result.repoName = repoName;
        const mrId = await findMrId({
          groupName,
          repoName
        });
        result.url = `https://gitlab.mokahr.com/${groupName}/${repoName}/merge_requests/${mrId}`; // await action.callback({ repoId, mrId });

        result.status = `${action.title} done`;
      } catch (e) {
        result.status = e.message;
      }

      results.push(result);
    }

    console.table(results);
  }

  async function approveRepo({
    repoId,
    mrId
  }) {
    const res = await fetch(`https://gitlab.mokahr.com/api/v4/projects/${repoId}/merge_requests/${mrId}/approve`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua": '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token": "xXlbCyiAd5Z2ZisFYqlavuoCn/f1wBPZdCOV/q+L7hKPlvFXRG9Vg9BRjM4GzUE8CwNlp/ibI6FRm4IEV0CTjw==",
        "x-requested-with": "XMLHttpRequest"
      },
      body: null,
      method: "POST",
      mode: "cors",
      credentials: "include"
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Approve failed: ${await res.text()}`);
    }

    return true;
  }

  const action = {
    title: '合并所有merge到release的MR',
    callback: approveRepo
  };

  const actions = [action];

  function init() {
    const repoNames = ["mage-client", "mage-hr-mobile-client", "mage-hm-mobile-client", "apply-web", "apply-mobile"];
    actions.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.innerText = item.title;

      btn.onclick = () => {
        btn.classList.add('disabled');
        btn.innerText = '操作中...';
        applyForAllRepos(repoNames, item).then(() => {
          btn.classList.remove('disabled');
          btn.innerText = item.title;
        });
      };

      document.querySelector('.page-title-controls').append(btn);
    });
  }

  init();

}());
