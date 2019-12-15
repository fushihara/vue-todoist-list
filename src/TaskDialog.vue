<template>
  <el-dialog v-bind:title="title" :visible.sync="value.dialogFormVisible" :append-to-body="true">
    <el-form :model="form" label-position="top">
      <el-form-item label="本文" :label-width="formLabelWidth">
        <el-input
          v-model="value.bodyText"
          autocomplete="off"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10}"
        ></el-input>
      </el-form-item>
      <el-form-item label="プロジェクト" :label-width="formLabelWidth">
        <el-select v-model="value.projectId" v-bind:disabled="projectDisable" placeholder="プロジェクトを選択">
          <el-option
            v-for="project in value.projectList"
            v-bind:key="project.id"
            v-bind:label="project.label"
            v-bind:value="project.id"
          >
            <span style="float: left">{{project.label}}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="value.dialogFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="onSaveClose">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import dateformat from "dateformat";
import { MDCMenu, Corner } from '@material/menu';
import { TextLink } from "./utils/TextLink";
import { TaskDialogPropsType } from "./d.ts/TaskDialog"

export default Vue.extend({
  props: {
    value: Object as PropType<TaskDialogPropsType>
  },
  data(){
    return {
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '100px'
    };
  },
  computed: {
    title():string {
      return (this.value as TaskDialogPropsType).taskId === null ? "タスクを新規追加" : "タスクを編集"
    },
    projectDisable():boolean{
      return (this.value as TaskDialogPropsType).taskId !== null
    }
  },
  methods: {
    onSaveClose(){
      this.$emit("save");
    },
  }
});
</script>
<style lang="scss" scoped>
</style>