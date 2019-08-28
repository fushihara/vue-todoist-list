import uuidV1 from "uuid/v1";

export namespace TodoistApi {
  export function createNewItem(token: string, content: string, projectId: number) {
    const result = TodoistApi.v8.newItem(token, content, projectId);
    return result;
  }
  export function updateItem(token: string, itemId: number, content: string) {
    const result = TodoistApi.v8.updateItem(token, itemId, content);
    return result;
  }
  export function archiveItem(token: string, itemId: number) {
    const result = TodoistApi.v8.itemArchive(token, itemId);
    return result;
  }
  export function sync(token: string): Promise<SyncResult> {
    const result = TodoistApi.v8.sync(token, ["all"] /* ["items", "labels", "notes", "projects"] */, "*").then(data => {
      if (!data.items) { throw new Error("itemsがありません"); }
      if (!data.labels) { throw new Error("labelsがありません"); }
      if (!data.notes) { throw new Error("notesがありません"); }
      if (!data.projects) { throw new Error("projectsがありません"); }
      const projects: Project[] = data.projects.map<Project>(a => {
        return {
          child_order: Number(a.child_order),
          collapsed: Number(a.collapsed),
          color: v8.colors.get(Number(a.color)) || "",
          has_more_notes: Boolean(a.has_more_notes),
          id: Number(a.id),
          inbox_project: Boolean(a.inbox_project || false),
          is_archived: Number(a.is_archived) != 0,
          is_deleted: Number(a.is_deleted) != 0,
          is_favorite: Number(a.is_favorite) != 0,
          name: String(a.name),
          parent_id: (a.parent_id === null ? null : Number(a.parent_id)),
          shared: Boolean(a.shared)
        }
      });
      const notes: Note[] = data.notes.map<Note>(a => {
        var file_attachment: NoteAttachmentWebsite | NoteAttachmentImage | null = null;
        if (a.file_attachment && a.file_attachment.resource_type == "website") {
          const siteData: NoteAttachmentWebsite = {
            description: String(a.file_attachment.description),
            image: String(a.file_attachment.image),
            image_height: Number(a.file_attachment.image_height),
            image_width: Number(a.file_attachment.image_width),
            resource_type: "website",
            site_name: String(a.file_attachment.site_name),
            title: String(a.file_attachment.title),
            url: String(a.file_attachment.url)
          };
          file_attachment = siteData;
        } else if (a.file_attachment && a.file_attachment.resource_type == "image") {
          const file: NoteAttachmentImage = {
            file_name: String(a.file_attachment.file_name),
            file_size: Number(a.file_attachment.file_size),
            file_type: String(a.file_attachment.file_type),
            file_url: String(a.file_attachment.file_url),
            image: String(a.file_attachment.image),
            image_height: Number(a.file_attachment.image_height),
            image_width: Number(a.file_attachment.image_width),
            resource_type: "image",
            upload_state: String(a.file_attachment.upload_state)
          };
          file_attachment = file;
        }
        return {
          content: String(a.content),
          file_attachment: file_attachment,
          id: Number(a.id),
          is_deleted: Number(a.is_deleted) != 0,
          item_id: Number(a.item_id),
          posted: new Date(String(a.posted)),
          posted_uid: Number(a.posted_uid),
          project_id: Number(a.project_id),
          reactions: a.reactions === null ? null : a.reactions
        }
      });
      const labels: Label[] = data.labels.map<Label>(a => {
        return {
          color: v8.colors.get(Number(a.color)) || "",
          id: Number(a.id),
          is_deleted: Number(a.is_deleted) !== 0,
          is_favorite: Number(a.is_favorite) !== 0,
          item_order: Number(a.item_order),
          name: String(a.name)
        };
      });
      const items: Item[] = data.items.map<Item>(item => {
        const item_id = Number(item.id);
        const project_id = Number(item.project_id);
        const project = projects.find(a => a.id == project_id);
        const note = notes.filter(a => a.item_id == item_id)
        const label = item.labels.map((labelId: number) => labels.find(a => a.id == labelId))
        if (!project) { throw new Error("projectがありません"); }
        return {
          project,
          notes: note,
          labels: label,
          id: item_id,
          content: String(item.content),
          dateAdded: new Date(item.date_added),
          checked: Number(item.checked),
          child_order: Number(item.child_order),
          collapsed: Number(item.collapsed),
          date_completed: item.date_completed === null ? null : new Date(item.date_completed),
          day_order: Number(item.day_order),
          has_more_notes: Boolean(item.has_more_notes),
          in_history: Number(item.in_history) != 0,
          is_deleted: Number(item.is_deleted) != 0,
          parent_id: item.parent_id === null ? null : Number(item.parent_id),
          priority: Number(item.priority)
        };
      });
      return {
        items: items,
        projects
      };
    });
    return result;
  }
  export type SyncResult = {
    items: Item[],
    projects: Project[]
  };
  export type Item = {
    project: Project,
    notes: Note[],
    labels: Label[]
    id: number,
    content: string,
    dateAdded: Date,
    checked: number,
    child_order: number,
    collapsed: number,
    date_completed: Date | null,
    day_order: number,
    has_more_notes: boolean,
    in_history: boolean,
    is_deleted: boolean,
    parent_id: number | null,
    priority: number
  }
  export type Project = {
    child_order: number,
    collapsed: number,
    color: string,
    has_more_notes: boolean,
    id: number,
    inbox_project: boolean,
    is_archived: boolean,
    is_deleted: boolean,
    is_favorite: boolean,
    name: string,
    parent_id: number | null,
    shared: boolean
  }
  export type Label = {
    color: string,
    id: number,
    is_deleted: boolean,
    is_favorite: boolean,
    item_order: number,
    name: string
  };
  export type Note = {
    content: string,
    file_attachment: NoteAttachment | null,
    id: number,
    is_deleted: boolean,
    item_id: number,
    posted: Date,
    posted_uid: number,
    project_id: number,
    reactions: { [key: string]: number[] } // {絵文字:ユーザid[]}
  };
  export type NoteAttachment = NoteAttachmentWebsite | NoteAttachmentImage;
  export type NoteAttachmentWebsite = {
    description: string,
    image: string,
    image_height: number,
    image_width: number,
    resource_type: "website",
    site_name: string,
    title: string,
    url: string
  };
  export type NoteAttachmentImage = {
    file_name: string,
    file_size: number,
    file_type: string,
    file_url: string,
    image: string,
    image_height: number,
    image_width: number,
    resource_type: "image",
    upload_state: string
  };
  export namespace v8 {
    export type ResourceType = "labels" | "projects" | "items" | "notes" | "filters" | "reminders" | "locations" | "user" | "live_notifications" | "collaborators" | "user_settings" | "notification_settings" | "all";
    export namespace Type {
      export type SyncResult = {
        collaborator_states?: any[], // unknown
        collaborators?: any[],//unknown
        day_orders?: { [key: string]: number },
        day_orders_timestamp?: string,
        due_exceptions?: any[],//unknown
        filters?: Filter[],
        full_sync: boolean,
        incomplete_item_ids?: any[],//unknown
        incomplete_project_ids?: any[],//unknown
        items?: any[] /* Item[]*/,
        labels?: any[],
        live_notifications?: any[],
        live_notifications_last_read_id?: number,
        locations?: any[],//unknown
        notes?: any[],
        project_notes?: [],//unknown
        projects?: any[],
        reminders?: any[],//unknown
        sections?: any[],//unknown
        stats?: {},
        sync_token: string,
        temp_id_mapping: { [key: string]: number },//unknown
        tooltips?: {},
        user?: {},
        user_settings?: {}
      }
      export type Filter = {
        color: number,
        id: number,
        is_deleted: 0 | 1,
        is_favorite: 0 | 1,
        item_order: number,
        name: string,
        query: string
      }
      export type Item = {
        assigned_by_uid: null | number,
        checked: 1 | 0,
        child_order: number,
        collapsed: 1 | 0,
        content: string,
        date_added: string,
        date_completed: string | null,
        day_order: number,
        due: any,
        labels: number[]
      }
    }
    export const colors = new Map([
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
    export function newItem(token: string, content: string, projectId: number): Promise<{ newItemid: number }> {
      const uuid = uuidV1();
      const tempId = uuidV1();
      return fetch("https://todoist.com/api/v8/sync", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: [
          ["token", token],
          ["commands", JSON.stringify([{ "type": "item_add", "temp_id": tempId, "uuid": uuid, "args": { "content": content, "project_id": projectId } }])]
        ]
          .map(a => `${a[0]}=${encodeURIComponent(a[1])}`)
          .join("&")
      }).then(response => response.json().then(json => {
        const result = String(json.sync_status[uuid]);
        const newItemId = Number(json.temp_id_mapping[tempId]);
        if (result == "ok") {
          return { newItemid: newItemId };
        } else {
          throw new Error("");
        }
      }));
    }
    export function updateItem(token: string, itemId: number, content: string) {
      return fetch("https://todoist.com/api/v8/sync", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: [
          ["token", token],
          ["commands", JSON.stringify([{ "type": "item_update", "uuid": uuidV1(), "args": { "id": Number(itemId), "content": content } }])]
        ]
          .map(a => `${a[0]}=${encodeURIComponent(a[1])}`)
          .join("&")
      }).then(response => response.json());
    }
    export function itemArchive(token: string, itemId: number) {
      return fetch("https://todoist.com/api/v8/sync", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: [
          ["token", token],
          ["commands", JSON.stringify([{ "type": "item_complete", "uuid": uuidV1(), "args": { "id": Number(itemId) } }])]
        ]
          .map(a => `${a[0]}=${encodeURIComponent(a[1])}`)
          .join("&")
      }).then(response => response.json());
    }
    export function sync(token: string, resource_types: ResourceType[], sync_token: string = "*"): Promise<Type.SyncResult> {
      return fetch("https://todoist.com/api/v8/sync", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: [
          ["token", token],
          ["sync_token", sync_token],
          ["resource_types", `[${["all"].map(a => `"${a}"`).join(",")}]`]
        ]
          .map(a => `${a[0]}=${encodeURIComponent(a[1])}`)
          .join("&")
      }).then(response => response.json().then(json => {
        if (instanceOfSyncResult(json)) {
          return json;
        } else {
          throw new Error("type not match")
        }
      }))
    }
    function instanceOfSyncResult(data: any): data is Type.SyncResult {
      if (Object(data) !== data) {
        return false;
      }
      // 必須項目
      if (typeof data.full_sync !== "boolean") { return false; }
      if (typeof data.sync_token !== "string") { return false; }
      if (Object(data.temp_id_mapping) !== data.temp_id_mapping) { return false; }  // unknown
      for (let kv of Object.entries(data.temp_id_mapping)) {
        if (typeof kv[1] !== "number") { return false; }
      }
      // 任意項目
      if (!isArrayOrUndefinedCheck(data.collaborator_states)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.collaborators)) { return false; } // unknown
      if (!isObjectOrUndefinedCheck(data.day_orders)) { return false; }
      else {
        for (let kv of Object.entries(data.day_orders)) {
          if (typeof kv[1] !== "number") { return false; }
        }
      }
      if (!isStringOrUndefinedCheck(data.day_orders_timestamp)) { return false; }
      if (!isArrayOrUndefinedCheck(data.due_exceptions)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.filters)) { return false; }
      else {
        for (let v of data.filters) {
          if (!isNotNullAndUndefined(v)) { return false; }
          if (!isNumber(v.color)) { return false; }
          if (!isNumber(v.id)) { return false; }
          if (!isNumber(v.is_deleted)) { return false; }
          if (!isNumber(v.is_favorite)) { return false; }
          if (!isNumber(v.item_order)) { return false; }
          if (!isString(v.name)) { return false; }
          if (!isString(v.query)) { return false; }
        }
      }
      if (!isArrayOrUndefinedCheck(data.incomplete_item_ids)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.incomplete_project_ids)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.items)) { return false; }
      if (!isArrayOrUndefinedCheck(data.labels)) { return false; }
      if (!isArrayOrUndefinedCheck(data.live_notifications)) { return false; }
      if (!isNumberOrUndefinedCheck(data.live_notifications_last_read_id)) { return false; }
      if (!isArrayOrUndefinedCheck(data.locations)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.notes)) { return false; }
      if (!isArrayOrUndefinedCheck(data.project_notes)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.projects)) { return false; }
      if (!isArrayOrUndefinedCheck(data.reminders)) { return false; } // unknown
      if (!isArrayOrUndefinedCheck(data.sections)) { return false; } // unknown
      if (!isObjectOrUndefinedCheck(data.stats)) { return false; }
      if (!isObjectOrUndefinedCheck(data.tooltips)) { return false; }
      if (!isObjectOrUndefinedCheck(data.user)) { return false; }
      if (!isObjectOrUndefinedCheck(data.user_settings)) { return false; }
      return true;
    }
  }
}
function isArrayOrUndefinedCheck(data: any): data is undefined | [] {
  return Array.isArray(data) || data === undefined;
}
function isObjectOrUndefinedCheck(data: any): data is undefined | object {
  return (Object(data) === data && !Array.isArray(data)) || data === undefined;
}
function isStringOrUndefinedCheck(data: any): data is undefined | string {
  return isString(data) || data === undefined;
}
function isNumberOrUndefinedCheck(data: any): data is undefined | number {
  return isNumber(data) || data === undefined;
}
function isNotNullAndUndefined(data: any): data is any {
  return data !== undefined && data !== null;
}
function isNumber(data: any): data is number {
  return typeof data == "number";
}
function isString(data: any): data is string {
  return typeof data === "string";
}