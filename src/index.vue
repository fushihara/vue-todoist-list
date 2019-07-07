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
      <vue-task
        v-for="(item) in itemList"
        :key="item.id"
        ref="task-list"
        v-bind:value="item"
        @open-menu="on_open_menu"
        style="display:flex;flex-direction:column;"
      ></vue-task>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { TodoistApi } from "./TodoistApi"
import { FlexStyles } from "./FlexStyles";
import VueTask from "./Task.vue";

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
    VueTask
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
      flex_styles: new FlexStyles(),
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
</style>