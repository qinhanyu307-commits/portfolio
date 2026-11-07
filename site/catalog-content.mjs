export function catalogEntries(content){
 return [...content.projects.map(p=>({id:p.id,title:p.catalogTitle,description:p.catalogDescription})),...(content.pages?.catalog?.entries||[])];
}
