<template>
  <div>
    <div style="display:flex;">
      <h2 style="flex:1 1 0;">
        <div v-html="text2html(value.content)"></div>
        <div v-if="isNoteOpen == false">
          <a v-for="file in attachmentFiles" v-bind:key="file.src" v-bind:href="file.src">
            <img v-bind:src="file.src" style="object-fit: contain;height: 100px;width: 100px;" />
          </a>
        </div>
      </h2>
      <div style="flex:0 0 30px;">
        <div class="mdc-menu-surface--anchor">
          <button
            class="material-icons"
            style="color: #00000047;"
            v-on:click.stop="push_menu_open_button(value)"
            v-bind:data-menu-id="value.id"
          >list</button>
          <div class="mdc-menu mdc-menu-surface">
            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
              <li class="mdc-list-item" role="menuitem" v-on:click="open_task(value)">
                <span class="material-icons">open_in_browser</span>
                <span class="mdc-list-item__text">タスクを開く</span>
              </li>
              <li class="mdc-list-item" role="menuitem" v-on:click="emit('change-complete',value)">
                <span class="material-icons">done_outline</span>
                <span class="mdc-list-item__text">タスクを完了にする</span>
              </li>
              <li class="mdc-list-item" role="menuitem" v-on:click="emit('edit-task',value)">
                <span class="material-icons">edit</span>
                <span class="mdc-list-item__text">タスクのテキストを変更する</span>
              </li>
              <li class="mdc-list-item" role="menuitem" v-on:click="emit('delete-task',value)">
                <span class="material-icons">remove_circle</span>
                <span class="mdc-list-item__text">タスクを削除する</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;">
      <div style="flex:1 1 0;display:flex;align-items: center;font-size:10px;overflow: hidden;">
        <div
          style="width:10px;height:10px;border-radius:10px;margin:0 5px;flex: 0 0 10px;"
          v-bind:style="{backgroundColor:value.project.color}"
        ></div>
        <a
          style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;"
          v-bind:href="value.project.link"
          target="_blank"
          rel="noopener noreferrer nofollow"
          v-bind:title="value.project.name"
        >{{value.project.name}}</a>
      </div>
      <div style="flex:0 0 auto;font-size:10px;">
        <a
          v-bind:href="`https://todoist.com/showTask?id=${value.id}`"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >{{ format_date(value.dateAdded) }}</a>
      </div>
    </div>
    <div
      v-if="0 < value.notes.length && isNoteOpen == false"
      v-on:click="noteOpenClick"
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
import Vue, { PropType } from "vue";
import dateformat from "dateformat";
import { MDCMenu, Corner } from '@material/menu';
import { TextLink } from "./utils/TextLink";

export default Vue.extend({
  props: {
    value: Object
  },
  data() {
    if (this.value.notes && 0 < this.value.notes.length) {
      console.log(this.value.notes);
    }
    return {
      menuObj: null as MDCMenu | null,
      isNoteOpen: false as boolean
    };
  },
  computed: {
    attachmentFiles(): { src: string }[] {
      if (!this.value.notes || this.value.notes.length == 0) { return []; }
      return this.value.notes.filter((note: any) => {
        if (!note.file_attachment) { return false; }
        if (note.file_attachment.resource_type != "image") { return false; }
        if (note.file_attachment.upload_state != "completed") { return false; }
        return true;
      }).map((note: any) => {
        return {
          src: String(note.file_attachment.file_url || "")
        }
      });
    }
  },
  methods: {
    format_date(date: Date): string {
      dateformat.i18n.dayNames = [
        '日', '月', '火', '水', '木', '金', '土',
        '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
      ];
      return dateformat(date, "yyyy/mm/dd(ddd)HH:MM:ss");
    },
    text2html(html: string): string {
      return TextLink.format(html);
    },
    open_task(a: any): void {
      window.open(`https://todoist.com/showTask?id=${a.id}`);
    },
    emit(eventType: string, item: any): void {
      this.$emit(eventType, this.value.id);
    },
    need_close_menu(withoutId: number): void {
      if (withoutId === this.value.id) {
        return;
      }
      if (this.menuObj) {
        this.menuObj.open = false;
        this.menuObj = null;
      }
    },
    push_menu_open_button(item: any): void {
      this.$emit("open-menu", this.value.id);
      const pushButtonElement = this.$el.querySelector<HTMLElement>(`button[data-menu-id="${item.id}"]`)!
      const menuElement = pushButtonElement.parentElement!.querySelector(".mdc-menu")!;
      const a = new MDCMenu(menuElement);
      a.setAnchorCorner(Corner.BOTTOM_LEFT);
      a.setAnchorMargin({ left: -240 });
      a.open = true;
      this.menuObj = a;
    },
    noteOpenClick() {
      this.isNoteOpen = true;
    }
  },
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
  background: transparent;
  border: transparent;
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