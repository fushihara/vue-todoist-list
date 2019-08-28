<template>
  <div
    style="height:100%;display:flex;flex-direction:column;background-color:white;position: relative;"
  >
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
      <button v-on:click="push_new_item_button" v-bind:disabled="reload_button_disabled">新規追加</button>
      <button v-on:click="push_reload_button" v-bind:disabled="reload_button_disabled">再読込</button>
    </div>
    <div
      class="tasklist h-w100"
      style="flex:1 1 0;"
      v-bind:class="flex_styles.className"
      @wheel="listWheelEvent"
      data-is-scroll-parent
    >
      <vue-task
        v-for="(item) in itemList"
        :key="item.id"
        ref="task-list"
        v-bind:value="item"
        @open-menu="on_open_menu"
        @change-complete="onTaskChangeComplete"
        @edit-task="onEditTaskStart"
        @delete-task="onDeleteTask"
        style="display:flex;flex-direction:column;"
      ></vue-task>
    </div>
    <task-dialog v-bind:value="taskDialogModel" v-on:save="fireTaskEditComplete"></task-dialog>
    <el-dialog title="タスク完了ダイアログ" :visible.sync="taskCompleteDialog.dialogFormVisible">
      <span>{{taskCompleteDialog.bodyText}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="taskCompleteDialog.dialogFormVisible = false">取り消し</el-button>
        <el-button type="primary" @click="fireTaskChangeComplete">完了する</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import { TodoistApi } from "./utils/TodoistApi"
import { FlexStyles } from "./utils/FlexStyles";
import { getProjectList } from "./utils/ItemManager";
import VueTask from "./Task.vue";
import TaskDialog from "./TaskDialog.vue";
import { TaskDialogPropsType } from "./d.ts/TaskDialog"

Vue.use(ElementUI);

export default Vue.extend({
  mounted: function () {
    //alert(JSON.stringify({ availHeight: window.screen.availHeight, availWidth: window.screen.availWidth, height: window.screen.height, width: window.screen.width }, null, "  "))
    TodoistApi.sync(this.todoistApiKey).then(json => {
      if (json.items) {
        this.itemList = json.items.sort((a: any, b: any) => {
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        });
        this.projectList = json.projects;
      } else {
        this.itemList = [];
      }
      this.reload_button_disabled = false;
    });
  },
  components: {
    VueTask,
    TaskDialog
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
      projectList: [] as TodoistApi.Project[],
      reload_button_disabled: true,
      flex_styles: new FlexStyles(),
      taskDialogModel: {
        dialogFormVisible: false,
        bodyText: "",
        projectList: [],
        projectId: 0,
        taskId: 0
      } as TaskDialogPropsType,
      taskCompleteDialog: {
        dialogFormVisible: false,
        taskId: 0,
        bodyText: ""
      }
    };
  },
  computed: {
    listUlClass: function () { }
  },
  methods: {
    on_open_menu: function (sender: any) {
      for (let e of (this.$refs["task-list"] as any[])) {
        e.need_close_menu(sender);
      }
    },
    push_reload_button: function () {
      this.reload_button_disabled = true;
      this.$mount();
    },
    push_new_item_button: function () {
      this.taskDialogModel = {
        taskId: null,
        bodyText: "",
        dialogFormVisible: true,
        projectId: this.projectList.find(a => a.inbox_project === true)!.id,
        projectList: getProjectList(this.projectList)
      };
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
    },
    onTaskChangeComplete: function (eventId: number) {
      const item = this.itemList.find(a => a.id == Number(eventId));
      if (!item) {
        return;
      }
      this.taskCompleteDialog = {
        dialogFormVisible: true,
        taskId: eventId,
        bodyText: item.content
      };
    },
    fireTaskChangeComplete: function () {
      const loading = this.$loading({
        lock: true,
        text: 'タスクを完了に切り替え中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      const targetId = this.taskCompleteDialog.taskId;
      TodoistApi.archiveItem(this.todoistApiKey, targetId).then((result) => {
        this.itemList = this.itemList.filter(a => a.id !== targetId);
        this.taskCompleteDialog.dialogFormVisible = false;
        loading.close();
      });
    },
    onEditTaskStart: function (eventId: number) {
      const item = this.itemList.find(a => a.id == Number(eventId));
      if (!item) {
        return;
      }
      this.taskDialogModel = {
        taskId: item.id,
        bodyText: item.content,
        dialogFormVisible: true,
        projectId: item.project.id,
        projectList: getProjectList(this.projectList)
      };
    },
    fireTaskEditComplete: function () {
      const loading = this.$loading({
        lock: true,
        text: 'タスクを編集中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      const content = String(this.taskDialogModel.bodyText).trim();
      const projectId = Number(this.taskDialogModel.projectId);
      const targetId = this.taskDialogModel.taskId;
      if (targetId === null) {
        this.fireTaskNewCreate(content, projectId).then(contentId => {
          this.taskDialogModel.dialogFormVisible = false;
          loading.close();
          this.$mount();
        });
      } else {
        TodoistApi.updateItem(this.todoistApiKey, targetId, content).then((result) => {
          this.taskDialogModel.dialogFormVisible = false;
          loading.close();
          const item = this.itemList.find(a => a.id == Number(targetId));
          if (item) {
            item.content = content;
          }
        });
      }
    },
    fireTaskNewCreate: async function (content: string, projectId: number) {
      return TodoistApi.createNewItem(this.todoistApiKey, content, projectId);
    },
    onDeleteTask: function (eventId: string) {
      alert(`${eventId} のタスクを削除`);
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
.tasklist {
  > div {
    border-right: solid 2px #bbb;
    border-bottom: solid 2px #bbb;
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
.tasklist > div:last-child {
  border-bottom: 0;
}
.el-dialog__wrapper /deep/ .el-dialog {
  width: 90%;
}
.el-dialog__wrapper /deep/ .el-dialog__body {
  padding: 10px 10px;
}
</style>