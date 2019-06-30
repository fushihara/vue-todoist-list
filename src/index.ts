import TodoistList from "./TodoistList.vue";
const v2 = new TodoistList({
  propsData: {
    todoistApiKey: String(process.env.VUE_APP_TODOIST_API_KEY || ""),
  }
});
v2.$mount("#app");