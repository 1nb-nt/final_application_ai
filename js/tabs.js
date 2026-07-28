/* ==================== TABS ==================== */
document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("view-"+tab.dataset.tab).classList.add("active");
    if(tab.dataset.tab==="history") renderHistory();
    if(tab.dataset.tab==="config") renderConfig();
  });
});
