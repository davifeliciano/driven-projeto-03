"use strict";

// Telefone do restaurante
const phoneNumber = "5561999999999";
const itemContainers = document.querySelectorAll(".item-container");
const orderButton = document.querySelector(".order-button-container > button");
const fullnameInput = document.querySelector("#fullname");
const addressInput = document.querySelector("#address");
const formHint = document.querySelector(".input-container .form-hint");
const brlFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function sumArray(array) {
  // Dado um array, retorna a soma de seus elementos
  let sum = 0;
  for (const value of array) {
    sum += value;
  }
  return sum;
}

function convertPrice(priceInCents) {
  // Dado um preço em centavos (int), converter para reais (float)
  const centsInADollar = 100;
  return priceInCents / centsInADollar;
}

function formatPrice(priceInCents, leadingUnit = true) {
  /* Dado um preço em centavos (int), retorna uma string no
     formato "R$ XX,XX" se leadingUnit === true, do contrario
     usa o formato "XX,XX" */
  if (leadingUnit === true) {
    return brlFormat.format(convertPrice(priceInCents));
  }

  // Array no formato ["R$", " ", "XX", ",", "XX"]
  const formattedPriceArray = brlFormat.formatToParts(
    convertPrice(priceInCents)
  );

  const priceStartPosition = 2;
  return formattedPriceArray
    .slice(priceStartPosition) // Dipensa ["R$", " "]
    .map((obj) => obj.value)
    .join("");
}

function getSelectedItem(itemContainer) {
  // Dado um icon-container, retorna o primeiro item selecionado
  return itemContainer.querySelector(".selected");
}

function getAllSelectedItems() {
  // Retorna todos os itens selecionados
  const allSelectedItems = [];
  for (const itemContainer of itemContainers) {
    allSelectedItems.push(itemContainer.querySelector(".selected"));
  }

  return allSelectedItems;
}

function getItemName(item) {
  // Dado um item, retorna o nome do item
  return item.querySelector(".item-name").textContent;
}

function getItemPriceInCents(item) {
  // Dado um item, retorna seu preço em centavos
  const itemPriceFullString = item.querySelector(".item-price").textContent;
  //    ^ Preço com unidade, i.e. "R$ XX,XX"
  const [_, itemPriceString] = itemPriceFullString.split(" ");
  //        ^ Preço sem unidade, i.e. "XX,XX"
  return parseInt(itemPriceString.split(",").join(""));
}

function selectItem() {
  if (this.classList.contains("selected")) {
    return;
  }

  // Remova a classe de todos os irmãos
  for (const sibling of this.parentElement.children) {
    sibling.classList.remove("selected");
  }

  // Adiciona a classe selected ao elemento clicado
  this.classList.add("selected");
  /* Checa se as 3 categorias tem itens selecionados
     Nesse caso, ative o botão de pedido */
  for (const itemContainer of itemContainers) {
    if (getSelectedItem(itemContainer) === null) {
      return;
    }
  }

  orderButton.textContent = "Fechar Pedido";
  orderButton.removeAttribute("disabled");
}

function getUserInfo() {
  /* Retorna um objeto com fullname e address do usuário
     se houver. Do contário, retorna null */
  const fullname = fullnameInput.value.trim();
  const address = addressInput.value.trim();
  for (const value of [fullname, address]) {
    if (value === "") {
      return null;
    }
  }
  return { fullname: fullname, address: address };
}

function hideAllModals() {
  // Esconde todos os modals
  const modals = document.querySelectorAll(".modal-container");
  for (const modal of modals) {
    modal.classList.add("hidden");
  }
}

function showOrderModal() {
  // Checa se os campos de nome e endereço não estão em branco
  if (getUserInfo() === null) {
    formHint.classList.remove("hidden");
    return;
  }

  const orderModal = document.querySelector("#order-modal");
  const allSelectedItems = getAllSelectedItems();
  const prices = allSelectedItems.map(getItemPriceInCents);
  const orderItems = orderModal.querySelectorAll(".summary-item.meal");

  // Adicionando informações dos itens selecionados
  for (let i = 0; i < allSelectedItems.length; i++) {
    const item = allSelectedItems[i];
    const nameSpan = document.createElement("span");
    nameSpan.textContent = getItemName(item);
    orderItems[i].appendChild(nameSpan);
    const priceSpan = document.createElement("span");
    priceSpan.textContent = formatPrice(prices[i], false);
    orderItems[i].appendChild(priceSpan);
  }

  // Adicionando total do pedido em order-summary
  const orderTotal = orderModal.querySelector(".summary-item.total");
  const totalPrice = formatPrice(sumArray(prices));
  const totalSpan = document.createElement("span");
  totalSpan.textContent = totalPrice;
  orderTotal.appendChild(totalSpan);

  // Exibindo modal com o resumo do pedido
  hideAllModals();
  orderModal.classList.remove("hidden");
}

function showUserFormModal() {
  const userFormModal = document.querySelector("#user-form-modal");
  hideAllModals();
  userFormModal.classList.remove("hidden");
  fullnameInput.focus();
}

function getWhatsAppUrl(fullname, address) {
  const items = getAllSelectedItems();
  if (items === null) {
    return null;
  }

  const prices = items.map(getItemPriceInCents);
  const totalPrice = formatPrice(sumArray(prices));
  const message = encodeURI(`Olá, gostaria de fazer o pedido:
- Prato: ${getItemName(items[0])}
- Bebida: ${getItemName(items[1])}
- Sobremesa: ${getItemName(items[2])}
Total: ${totalPrice}

Nome: ${fullname}
Endereço: ${address}`);

  return `https://wa.me/${phoneNumber}?text=${message}`;
}

function redirectUser() {
  // Redireciona o usuário para uma
  const userInfo = getUserInfo();
  const whatsAppUrl = getWhatsAppUrl(userInfo.fullname, userInfo.address);
  window.location.replace(whatsAppUrl);
}

window.onload = () => {
  // Chame selectItem quando um card é clicado
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("click", selectItem);
  });

  /* Coloque o foco no input #address ao pressionar
     Enter quando o input #fullname estiver em foco */
  fullnameInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      addressInput.focus();
    }
  });

  /* Chame showOrderModal ao pressionar Enter
     quando o input #address estiver em foco */
  addressInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      showOrderModal();
    }
  });
};
