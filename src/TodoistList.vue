<template>
  <div style="height:100%;display:flex;flex-direction:column;background-color:white;">
    <link
      rel="stylesheet"
      href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic"
    >
    <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
    <div style="flex:0 0 auto;">
      <button v-on:click="push_reload_button" v-bind:disabled="reload_button_disabled">再読込</button>
    </div>
    <div class="tasklist" style="flex:1 1 0;overflow-y:scroll;">
      <div
        v-for="(item) in mockSwipeList"
        :key="item.id"
        style="display:flex;flex-direction:column;"
      >
        <div style="display:flex;">
          <h2 style="flex:1 1 0;" v-html="item.content"></h2>
          <div style="flex:0 0 30px;">
            <md-menu md-direction="bottom left" md-size="6">
              <md-button class="md-icon-button" md-menu-trigger>
                <md-icon>list</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item v-on:selected="open_task(item)">
                  <md-icon>open_in_browser</md-icon>
                  <span>タスクを開く</span>
                </md-menu-item>
                <md-menu-item disabled>
                  <md-icon>done_outline</md-icon>
                  <span>タスクを完了にする</span>
                </md-menu-item>
                <md-menu-item disabled>
                  <md-icon>edit</md-icon>
                  <span>タスクのテキストを変更する</span>
                </md-menu-item>
                <md-menu-item disabled>
                  <md-icon>remove_circle</md-icon>
                  <span>タスクを削除する</span>
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </div>
        </div>
        <div style="display:flex;">
          <div style="flex:1 1 0;display:flex;align-items: center;">
            <div
              style="width:10px;height:10px;border-radius:10px;background-color:red;margin:0 5px;"
              v-bind:style="item.project.markStyle"
            ></div>
            <a
              v-bind:href="item.project.link"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >{{item.project.name}}</a>
          </div>
          <div style="flex:0 0 auto;font-size:10px;">{{ item.dateAddedStr }}</div>
        </div>
        <div v-if="0 < item.notes.length" style="padding:0 0px;" class="notes">
          <div
            v-for="noteItem in item.notes"
            :key="noteItem.id"
            style="display:flex;flex-direction:column;"
          >
            <div style="display:flex;">
              <div v-html="noteItem.content" style="font-size:13px;"></div>
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
                >
              </a>
            </div>
            <div style="text-align:right;font-size:10px;">{{noteItem.posted}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import dateformat from "dateformat";

import { MdCore, MdButton, MdMenu, MdList, MdBackdrop, MdIcon } from 'vue-material'
import 'vue-material/dist/vue-material.css'
Vue.use(MdCore)
Vue.use(MdButton)
Vue.use(MdMenu)
Vue.use(MdList)
Vue.use(MdBackdrop)
Vue.use(MdIcon)

function text2html(html: string) {
  // xssあり
  html = html.replace(
    /(.?)(https?:\/\/\S+)(\S)/g,
    (matchAll: string, m1: string, m2: string, m3: string) => {
      const kakkos = new Map([["[", "]"], ["(", ")"], ["<", ">"], ["{", "}"]]);
      // m1がkakkosの中に当てはまるかどうかチェック
      if (kakkos.get(m1) === m3) {
        return `${m1}<a href="${m2}" rel="noopener noreferrer nofollow" target="_blank">${m2}</a>${m3}`;
      } else {
        const url = m2 + m3;
        return `${m1}<a href="${url}" rel="noopener noreferrer nofollow" target="_blank">${url}</a>`;
      }
    }
  );
  html = html.replace(/\n/g, "<br>");
  return html;
}

export default Vue.extend({
  mounted: function () {
    if(document.body.classList){
      document.body.classList.remove("md-theme-default");
    }
    const colors = new Map([
      [30, "#b8256f"],
      [31, "#db4035"],
      [32, "#ff9933"],
      [33, "#fad000"],
      [34, "#afb83b"],
      [35, "#7ecc49"],
      [36, "#299438"],
      [37, "#6accbc"],
      [38, "#158fad"],
      [39, "#14aaf5"],
      [40, "#96c3eb"],
      [41, "#4073ff"],
      [42, "#884dff"],
      [43, "#af38eb"],
      [44, "#eb96eb"],
      [45, "#e05194"],
      [46, "#ff8d85"],
      [47, "#808080"],
      [48, "#b8b8b8"],
      [49, "#ccac93"]
    ]);
    const resource_types = ["items", "labels", "notes", "projects"];
    fetch("https://todoist.com/api/v8/sync", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: [
        ["token", this.todoistApiKey],
        ["sync_token", "*"],
        ["resource_types", `[${resource_types.map(a => `"${a}"`).join(",")}]`]
      ]
        .map(a => `${a[0]}=${encodeURIComponent(a[1])}`)
        .join("&")
    })
      .then(a => a.json())
      .then(json => {
        console.log(json.items);
        this.mockSwipeList = json.items
          .map((a: any) => {
            const projectId = Number(a.project_id);
            const projectName = json.projects.find((b: any) => b.id == projectId).name;
            const projectColorNumber = json.projects.find((b: any) => b.id == projectId).color;
            const itemId = Number(a.id);
            const notes = json.notes
              .filter((b: any) => b.item_id == itemId)
              .map((b: any) => {
                return {
                  content: text2html(b.content),
                  posted: dateformat(new Date(b.posted), "yyyy/mm/dd(ddd)HH:MM:ss"),
                  file_attachment: b.file_attachment
                };
              });
            return {
              id: itemId,
              content: text2html(a.content),
              dateAddedStr: dateformat(new Date(a.date_added), "yyyy/mm/dd(ddd)HH:MM:ss"),
              dateAdded: new Date(a.date_added),
              project: {
                name: projectName,
                markStyle: {
                  backgroundColor: colors.get(projectColorNumber)
                },
                link: `https://todoist.com/app?#project%2F${projectId}`
              },
              notes: notes
            };
          })
          .sort((a: any, b: any) => {
            return b.dateAdded.getTime() - a.dateAdded.getTime();
          }).filter((a: any, index: number) => index < 1000);
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
      mockSwipeList: [],
      reload_button_disabled:true
    };
  },
  computed: {
    listUlClass: function () { }
  },
  methods: {
    reloadData: function () { },
    open_task:function(a:any){
      window.open( `https://todoist.com/showTask?id=${a.id}` );
    },
    push_reload_button:function(){
      this.reload_button_disabled = true;
      this.$mount();
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
.tasklist h2 {
  margin: 0;
  font-size: 100%;
  font-weight: normal;
  word-break: break-all;
}
.tasklist > div {
  border-bottom: solid 2px #bbb;
}
.tasklist > div:last-child {
  border-bottom: 0;
}
.tasklist /deep/ .notes > div:nth-child(even) {
  background-color: #f0f0f0;
}
.tasklist /deep/ .notes > div:nth-child(odd) {
  background-color: #e0e0e0;
}
</style>