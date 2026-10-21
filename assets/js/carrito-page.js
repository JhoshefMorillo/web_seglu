/* ============================================
   CARRITO — página /carrito.html (lógica de vista)
   Se separó del <script> inline de carrito.html para
   mantener HTML/CSS/JS separados.
   Se asume disponible (scripts previos):
     - SEGLU_CART  (carrito.js)       -> api.setQty / api.remove / api.items / .mensajePedido()
     - clave       (carrito.js)       -> clave(id, talla)
     - mostrarConfirmarEliminar (carrito.js) -> modal global
     - ICONO_POR_SLUG (catalog.js)    -> opcional
   Carga ESTE archivo DESPUÉS de carrito.js para que
   window.renderCarrito ya exista cuando nos enganchamos.
   ============================================ */
(function () {
  const PER_PAGE = 6;
  let page = 1;

  const rowsEl  = document.getElementById("cartPageRows");
  const fullEl  = document.getElementById("cartPageFull");
  const emptyEl = document.getElementById("cartPageEmpty");
  const pagEl   = document.getElementById("cartPagePagination");
  const waEl    = document.getElementById("cartPageWa");
  const siItems = document.getElementById("cartSummaryItems");
  const siQty   = document.getElementById("cartSummaryQty");

  if (!rowsEl || !fullEl || !emptyEl || !pagEl || !waEl) return;

  const esc = s => String(s||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[c]));
  const clave = (id,t) => `${id}__${t||"unico"}`;
  const imgDe = i => i.image||(typeof ICONO_POR_SLUG!=="undefined"?ICONO_POR_SLUG[i.categoria]:"")||"";

  function rowHtml(item){
    const key=clave(item.id,item.talla);
    return `<div class="cart-row" data-key="${key}">
      <button type="button" class="cart-row__remove" data-premove aria-label="Eliminar ${esc(item.name)}">X</button>
      <img class="cart-row__img" src="${imgDe(item)}" alt="${esc(item.name)}" />
      <div class="cart-row__info">
        <span class="cart-row__label">PRODUCTO</span>
        <p class="cart-row__name">${esc(item.name)}</p>
        <span class="cart-row__meta">${esc(item.marca)}${item.talla?" · Talla "+esc(item.talla):""}</span>
      </div>
      <div class="cart-row__qty-block">
        <span class="cart-row__label">CANTIDAD</span>
        <div class="cart-row__qty">
          <button type="button" data-pminus aria-label="Disminuir cantidad">−</button>
          <input type="number" min="1" max="999" value="${item.qty}" data-pqty aria-label="Cantidad" />
          <button type="button" data-pplus aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
    </div>`;
  }

  function buildPag(total, cur){
    const pages=Math.ceil(total/PER_PAGE);
    if(pages<=1){pagEl.hidden=true;return;}
    pagEl.hidden=false;
    let h=`<button class="cart-pagination__btn cart-pagination__arrow" data-g="prev" ${cur===1?"disabled":""} aria-label="Anterior">&#8249;</button>`;
    for(let i=1;i<=pages;i++) h+=`<button class="cart-pagination__btn ${i===cur?"is-active":""}" data-g="${i}">${i}</button>`;
    h+=`<button class="cart-pagination__btn cart-pagination__arrow" data-g="next" ${cur===pages?"disabled":""} aria-label="Siguiente">&#8250;</button>`;
    pagEl.innerHTML=h;
    pagEl.querySelectorAll("[data-g]").forEach(b=>b.addEventListener("click",()=>{
      const v=b.dataset.g, ps=Math.ceil(SEGLU_CART.items.length/PER_PAGE);
      if(v==="prev")page=Math.max(1,page-1);
      else if(v==="next")page=Math.min(ps,page+1);
      else page=+v;
      render();
    }));
  }
  function render(){
    const sidebarEl = document.querySelector(".cart-sidebar");
    const layoutEl  = document.querySelector(".carrito-page__layout");
    const items=SEGLU_CART.items;
    if(!items.length){
      fullEl.hidden=true;
      fullEl.style.display="none";
      emptyEl.hidden=false;
      emptyEl.style.display="";
      if(sidebarEl) {
        sidebarEl.hidden = true;
        sidebarEl.style.display = "none";
      }
      if(layoutEl) layoutEl.classList.add("is-empty");
      waEl.classList.add("is-disabled");
      if(siItems)siItems.textContent="0";
      if(siQty)siQty.textContent="0";
      return;
    }
    fullEl.hidden=false;
    fullEl.style.display="";
    emptyEl.hidden=true;
    emptyEl.style.display="none";
    if(sidebarEl) {
      sidebarEl.hidden = false;
      sidebarEl.style.display = "";
    }
    if(layoutEl) layoutEl.classList.remove("is-empty");
    const pages=Math.ceil(items.length/PER_PAGE);
    page=Math.min(page,pages);
    const slice=items.slice((page-1)*PER_PAGE, page*PER_PAGE);
    rowsEl.innerHTML=slice.map(rowHtml).join("");
    buildPag(items.length,page);
    if(siItems)siItems.textContent=items.length;
    if(siQty)siQty.textContent=items.reduce((a,i)=>a+i.qty,0);
    const wn=window.WHATSAPP_NUMBER||"51904881704";
    waEl.href=`https://wa.me/${wn}?text=${SEGLU_CART.mensajePedido()}`;
    waEl.classList.remove("is-disabled");

    rowsEl.querySelectorAll(".cart-row").forEach(row=>{
      const key=row.dataset.key;
      const idx=key.lastIndexOf("__");
      const id=idx>-1?key.slice(0,idx):key;
      const ta=idx>-1?key.slice(idx+2):"";
      const talla=ta==="unico"?"":ta;
      const get=()=>SEGLU_CART.items.find(i=>clave(i.id,i.talla)===key);
      row.querySelector("[data-pplus]")?.addEventListener("click",()=>{const a=get();if(a)SEGLU_CART.setQty(id,talla,a.qty+1);});
      row.querySelector("[data-pminus]")?.addEventListener("click",()=>{const a=get();if(a)SEGLU_CART.setQty(id,talla,a.qty-1);});
      row.querySelector("[data-pqty]")?.addEventListener("change",e=>{const v=+e.target.value;if(!isNaN(v)&&v>0)SEGLU_CART.setQty(id,talla,v);else{const a=get();if(a)e.target.value=a.qty;}});
      row.querySelector("[data-premove]")?.addEventListener("click",()=>{
        const a=get();
        mostrarConfirmarEliminar(a?.name||"este producto",()=>SEGLU_CART.remove(id,talla));
      });
    });
  }

  // Refresca esta vista cuando cambia el carrito.
  // Debe engancharse DENTRO de DOMContentLoaded: carrito.js define
  // window.renderCarrito en su propio DOMContentLoaded (registrado antes,
  // por ser éste un script posterior), así que aquí ya existe y la envolvemos
  // SIN que la real nos pise la función.
  document.addEventListener("DOMContentLoaded",()=>{
    const _orig=window.renderCarrito;
    window.renderCarrito=function(lista){if(typeof _orig==="function")_orig(lista);render();};
    render();
  });

  // Ejecución directa si el script corre cuando el DOM ya se parseó
  if (document.readyState === "complete" || document.readyState === "interactive") {
    render();
  }
})();
