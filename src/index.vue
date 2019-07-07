<template>
  <div style="height:100%;display:flex;flex-direction:column;background-color:white;">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <div style="display:flex;flex:0 0 auto;">
      <div style="flex:1 1 0;"></div>
      <select v-model="flex_styles.activeStyle" style="height:100%;">
        <option
          v-for="(item) in flex_styles.options"
          :key="item.class"
          v-bind:value="item"
        >{{item.label}}</option>
      </select>
      <button v-on:click="push_reload_button" v-bind:disabled="reload_button_disabled">再読込</button>
    </div>
    <div
      class="tasklist h-w100"
      style="flex:1 1 0;"
      v-bind:class="flex_styles.className"
      @wheel="listWheelEvent"
      data-is-scroll-parent
    >
      <div v-for="(item) in itemList" :key="item.id" style="display:flex;flex-direction:column;">
        <div style="display:flex;">
          <h2 style="flex:1 1 0;" v-html="text2html(item.content)"></h2>
          <div style="flex:0 0 30px;">
            <div class="mdc-menu-surface--anchor">
              <button
                class="material-icons"
                v-on:click.stop="push_menu_open_button(item)"
                v-bind:data-menu-id="item.id"
              >list</button>
              <div class="mdc-menu mdc-menu-surface">
                <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                  <li class="mdc-list-item" role="menuitem" v-on:click="open_task(item)">
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
              v-bind:style="{backgroundColor:item.project.color}"
            ></div>
            <a
              v-bind:href="item.project.link"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >{{item.project.name}}</a>
          </div>
          <div style="flex:0 0 auto;font-size:10px;">{{ format_date(item.dateAdded) }}</div>
        </div>
        <div
          v-if="0 < item.notes.length && open_note_id.includes(item.id) == false"
          v-on:click="open_note_id.push(item.id)"
          style="background-color:#c5c5c5;color:black;padding:10px;display: flex;justify-content: center;align-items: center;border-radius: 0px 0px 30px 30px;"
        >
          <span class="material-icons">comment</span>コメント欄開く
        </div>
        <div
          v-if="0 < item.notes.length && open_note_id.includes(item.id) "
          style="padding:0 0px;"
          class="notes"
        >
          <div
            v-for="noteItem in item.notes"
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
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import dateformat from "dateformat";
import { MDCMenu, Corner } from '@material/menu';
import { TodoistApi } from "./TodoistApi"
import { TextLink } from "./TextLink";
import { FlexStyles } from "./FlexStyles";

export default Vue.extend({
  mounted: function () {
    TodoistApi.sync(this.todoistApiKey).then(json => {
      if (json.items) {
        this.itemList = json.items.sort((a: any, b: any) => {
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        });
      } else {
        this.itemList = [];
      }
      this.reload_button_disabled = false;
    });
  },
  components: {
  },
  props: {
    todoistApiKey: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      itemList: [] as TodoistApi.Item[],
      reload_button_disabled: true,
      menuObj: null as MDCMenu | null,
      open_note_id: [] as string[],
      flex_styles: new FlexStyles(),
    };
  },
  computed: {
    listUlClass: function () { }
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
    push_reload_button: function () {
      this.reload_button_disabled = true;
      this.$mount();
    },
    push_menu_open_button: function (item: any) {
      if (this.menuObj) {
        this.menuObj.open = false;
        this.menuObj = null;
      }
      const pushButtonElement = this.$el.querySelector<HTMLElement>(`button[data-menu-id="${item.id}"]`)!
      const menuElement = pushButtonElement.parentElement!.querySelector(".mdc-menu")!;
      const a = new MDCMenu(menuElement);
      a.setAnchorCorner(Corner.BOTTOM_LEFT);
      a.setAnchorMargin({ left: -240 });
      a.open = true;
      this.menuObj = a;
    },
    listWheelEvent: function (event: WheelEvent) {
      if (false) {
        // trueの時、このエレメントのスクロールは実行されない
        event.stopPropagation();
        return;
      }
      if (this.flex_styles.isHorizonalScroll) {
        const el = this.$el.querySelector<HTMLLIElement>("[data-is-scroll-parent]")!;
        el.scrollLeft += event.deltaY / 2;
        event.preventDefault();
      }
    }
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
.tasklist {
  > div {
    border-right: solid 2px #bbb;
  }
  &.v-w1_1,
  &.v-w1_2,
  &.v-w1_3,
  &.v-w1_4,
  &.v-w1_5,
  &.v-w1_6 {
    /* 縦にスクロールする。横幅100% */
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  }
  &.v-w1_1 > div {
    flex: 0 0 calc(100% / 1);
  }
  &.v-w1_2 > div {
    flex: 0 0 calc(100% / 2);
  }
  &.v-w1_3 > div {
    flex: 0 0 calc(100% / 3);
  }
  &.v-w1_4 > div {
    flex: 0 0 calc(100% / 4);
  }
  &.v-w1_5 > div {
    flex: 0 0 calc(100% / 5);
  }
  &.v-w1_6 > div {
    flex: 0 0 calc(100% / 6);
  }
  &.h-w250,
  &.h-w300,
  &.h-w400,
  &.h-w500 {
    /* 横にスクロールする。横幅200 */
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
  }
  &.h-w250 > div {
    width: 250px;
  }
  &.h-w300 > div {
    width: 300px;
  }
  &.h-w400 > div {
    width: 400px;
  }
  &.h-w500 > div {
    width: 500px;
  }
}
.tasklist h2 {
  margin: 0;
  font-size: 12px;
  font-weight: normal;
  word-break: break-all;
}
.tasklist > div {
  border-bottom: solid 2px #bbb;
}
.tasklist > div:last-child {
  border-bottom: 0;
}
.tasklist .notes > div:nth-child(even) {
  background-color: #f0f0f0;
}
.tasklist .notes > div:nth-child(odd) {
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