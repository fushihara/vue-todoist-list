const flexStyles = [
  { label: "1列", class: "v-w1_1" },
  { label: "横2列", class: "v-w1_2" },
  { label: "横3列", class: "v-w1_3" },
  { label: "横4列", class: "v-w1_4" },
  { label: "横5列", class: "v-w1_5" },
  { label: "横6列", class: "v-w1_6" },
  { label: "縦250px", class: "h-w250" },
  { label: "縦300px", class: "h-w300" },
  { label: "縦400px", class: "h-w400" },
  { label: "縦500px", class: "h-w500" },
];
const localStorageKey = "ubo34x1p-vue-todolist-flex-style"
export class FlexStyles {
  public readonly options = flexStyles;
  public get activeStyle() {
    return this._activeStyle;
  }
  public set activeStyle(val: any) {
    this._activeStyle = val;
    this.updateActiveStyle()
  }
  private _activeStyle: { label: string, class: string }
  public className = ""
  public isHorizonalScroll = false;
  constructor() {
    this.options = flexStyles;
    const selectValue = String(localStorage[localStorageKey] || "");
    this._activeStyle = this.options.find(a => a.class == selectValue) || this.options[0];
    this.updateActiveStyle();
  }
  private updateActiveStyle() {
    localStorage[localStorageKey] = this._activeStyle.class;
    this.className = this._activeStyle.class;
    this.isHorizonalScroll = !!this.className.match(/h-/);
  }
}