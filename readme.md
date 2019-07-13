  [![NPM Version][npm-version-image]][npm-site-url]
  [![NPM Downloads][downloads-image]][npm-site-url]
  [![NPM Minzip Size][npm-minzip-filesize]][npm-site-url]
  [![License][license-image]][npm-site-url]
  [![last commit date][last-commit-date-image]][npm-site-url]

<!--URL定義一覧 -->
[npm-site-url]: https://npmjs.org/package/@fushihara/vue-todoist-list
[npm-version-image]: https://img.shields.io/npm/v/@fushihara/vue-todoist-list.svg
[downloads-image]: https://img.shields.io/npm/dm/@fushihara/vue-todoist-list.svg
[npm-minzip-filesize]: https://img.shields.io/bundlephobia/minzip/@fushihara/vue-todoist-list.svg
[license-image]: https://img.shields.io/npm/l/@fushihara/vue-todoist-list.svg
[last-commit-date-image]: https://img.shields.io/github/last-commit/fushihara/vue-online-document-list.svg

# about
todoistの一覧を表示するvueコンポーネント。apiはv8。とりあえず動く。

# opensource

- アイコンにGoogleのMaterial Design iconsを使用しています。
    - https://github.com/google/material-design-icons
    - https://google.github.io/material-design-icons/
    - https://material.io/tools/icons/?icon=assignment_turned_in&style=baseline
- メニューに https://github.com/material-components/material-components-web を使用しています。

# changelog

メジャーバージョンが破壊的変更あり。マイナーバージョンは破壊的変更無し。リビジョンバージョンは使いません。

- 1.5.0 2019/07/07
  - タスクの日付欄にリンクを追加。メニューは不安定なので。
- 1.4.0 2019/07/07
  - コードリファクタリング。挙動に変更は無いはず。コードの変更が大きいから念の為バージョンを分ける。
- 1.3.0 2019/07/07
  - 横スクロールモードを追加
- 1.2.0 2019/07/07
  - コードのリファクタリング
- 1.1.0
  - メニュー用のUIライブラリを変更してモジュール外のスタイルシートに影響が出ないように修正
