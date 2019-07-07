<template>
  <div>
    <div style="display:flex;">
      <h2 style="flex:1 1 0;" v-html="text2html(value.content)"></h2>
      <div style="flex:0 0 30px;">
        <div class="mdc-menu-surface--anchor">
          <button
            class="material-icons"
            v-on:click.stop="push_menu_open_button(value)"
            v-bind:data-menu-id="value.id"
          >list</button>
          <div class="mdc-menu mdc-menu-surface">
            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
              <li class="mdc-list-item" role="menuitem" v-on:click="open_task(value)">
                <span class="material-icons">open_in_browser</span>
                <span class="mdc-list-item__text">タスクを開く</span>
              </li>
              <li class="mdc-list-item" role="menuitem" style="opacity:0.5;">
                <span class="material-icons">done_outline</span>
                <span class="mdc-list-item__text">タスクを完了にする</span>
              </li>
              <li class="mdc-list-item" role="menuitem" style="opacity:0.5;">
                <span class="material-icons">edit</span>
                <span class="mdc-list-item__text">タスクのテキストを変更する</span>
              </li>
              <li class="mdc-list-item" role="menuitem" style="opacity:0.5;">
                <span class="material-icons">remove_circle</span>
                <span class="mdc-list-item__text">タスクを削除する</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;">
      <div style="flex:1 1 0;display:flex;align-items: center;font-size:10px;">
        <div
          style="width:10px;height:10px;border-radius:10px;margin:0 5px;"
          v-bind:style="{backgroundColor:value.project.color}"
        ></div>
        <a
          v-bind:href="value.project.link"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >{{value.project.name}}</a>
      </div>
      <div style="flex:0 0 auto;font-size:10px;">{{ format_date(value.dateAdded) }}</div>
    </div>
    <div
      v-if="0 < value.notes.length && isNoteOpen == false"
      v-on:click="isNoteOpen = true"
      style="background-color:#c5c5c5;color:black;padding:10px;display: flex;justify-content: center;align-items: center;border-radius: 0px 0px 30px 30px;"
    >
      <span class="material-icons">comment</span>コメント欄開く
    </div>
    <div v-if="0 < value.notes.length && isNoteOpen " style="padding:0 0px;" class="notes">
      <div
        v-for="noteItem in value.notes"
        :key="noteItem.id"
        style="display:flex;flex-direction:column;"
      >
        <div style="display:flex;">
          <div v-html="text2html(noteItem.content)" style="font-size:13px;"></div>
        </div>
        <div style="text-align:center;padding:3px;" v-if="noteItem.file_attachment">
          <a
            v-bind:href="noteItem.file_attachment.file_url"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <img
              loading="lazy"
              v-bind:src="noteItem.file_attachment.file_url"
              style="max-width: 100%;height: 100px;object-fit:contains; border: solid 1px gray;"
            />
          </a>
        </div>
        <div style="text-align:right;font-size:10px;">{{format_date(noteItem.posted)}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import dateformat from "dateformat";
import { MDCMenu, Corner } from '@material/menu';
import { TextLink } from "./TextLink";

export default Vue.extend({
  mounted: function () {
  },
  components: {
  },
  props: {
    value: Object
  },
  data: function () {
    return {
      menuObj: null as MDCMenu | null,
      isNoteOpen: false
    };
  },
  computed: {
  },
  methods: {
    format_date: function (date: Date) {
      dateformat.i18n.dayNames = [
        '日', '月', '火', '水', '木', '金', '土',
        '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
      ];
      return dateformat(date, "yyyy/mm/dd(ddd)HH:MM:ss");
    },
    text2html: function (html: string) {
      return TextLink.format(html);
    },
    open_task: function (a: any) {
      window.open(`https://todoist.com/showTask?id=${a.id}`);
    },
    need_close_menu: function (withoutId: number) {
      if (withoutId === this.value.id) {
        return;
      }
      if (this.menuObj) {
        this.menuObj.open = false;
        this.menuObj = null;
      }
    },
    push_menu_open_button: function (item: any) {
      this.$emit("open-menu", this.value.id);
      const pushButtonElement = this.$el.querySelector<HTMLElement>(`button[data-menu-id="${item.id}"]`)!
      const menuElement = pushButtonElement.parentElement!.querySelector(".mdc-menu")!;
      const a = new MDCMenu(menuElement);
      a.setAnchorCorner(Corner.BOTTOM_LEFT);
      a.setAnchorMargin({ left: -240 });
      a.open = true;
      this.menuObj = a;
    },
  },
  watch: {
  }
});
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
  word-break: break-all;
}
h2 {
  margin: 0;
  font-size: 12px;
  font-weight: normal;
  word-break: break-all;
}
.notes > div:nth-child(even) {
  background-color: #f0f0f0;
}
.notes > div:nth-child(odd) {
  background-color: #e0e0e0;
}

.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px; /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: "liga";
}
@import "@material/list/mdc-list";
@import "@material/menu-surface/mdc-menu-surface";
@import "@material/menu/mdc-menu";
</style>