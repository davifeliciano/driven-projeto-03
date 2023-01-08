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

// Global para guardar informações do usuário
const userInfo = { fullname: "", address: "" };

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
  return (
    formattedPriceArray
      // Dipensa ["R$", " "]
      .slice(priceStartPosition)
      .map((obj) => obj.value)
      .join("")
  );
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
  return item.querySelector(".item-name").innerText;
}

function getItemPriceInCents(item) {
  // Dado um item, retorna seu preço em centavos
  const itemPriceFullString = item.querySelector(".item-price").innerText;
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

  orderButton.innerText = "Fechar Pedido";
  orderButton.removeAttribute("disabled");
}

function getUserInfo() {
  /* Exibe uma sequencia de prompts pedindo nome e endereço
     do usuário, populando a global userInfo com os resultados */
  const fullname = prompt("Insira seu nome").trim();
  const address = prompt("Insira seu endereço").trim();
  const retrievedUserInfo = { fullname, address };
  for (const [key, value] of Object.entries(retrievedUserInfo)) {
    if (value !== null) {
      userInfo[key] = value;
    }
  }
}

function hideAllModals() {
  // Esconde todos os modals
  const modals = document.querySelectorAll(".modal-container");
  for (const modal of modals) {
    modal.classList.add("hidden");
  }
}

function showOrderModal() {
  getUserInfo();

  const orderModal = document.querySelector("#order-modal");
  const allSelectedItems = getAllSelectedItems();
  const prices = allSelectedItems.map(getItemPriceInCents);
  const orderItems = orderModal.querySelectorAll(".summary-item.meal");

  // Adicionando informações dos itens selecionados
  for (let i = 0; i < allSelectedItems.length; i++) {
    const item = allSelectedItems[i];
    const nameSpan = document.createElement("span");
    nameSpan.innerText = getItemName(item);
    orderItems[i].appendChild(nameSpan);
    const priceSpan = document.createElement("span");
    priceSpan.innerText = formatPrice(prices[i], false);
    orderItems[i].appendChild(priceSpan);
  }

  // Adicionando total do pedido em order-summary
  const orderTotal = orderModal.querySelector(".summary-item.total");
  const totalPrice = formatPrice(sumArray(prices));
  const totalSpan = document.createElement("span");
  totalSpan.innerText = totalPrice;
  orderTotal.appendChild(totalSpan);

  // Exibindo modal com o resumo do pedido
  hideAllModals();
  orderModal.classList.remove("hidden");
}

function getWhatsAppUrl() {
  const items = getAllSelectedItems();
  if (items === null) {
    return null;
  }

  const [dishName, drinkName, dessertName] = items.map(getItemName);
  const prices = items.map(getItemPriceInCents);
  const totalPrice = formatPrice(sumArray(prices));

  let message = `Olá, gostaria de fazer o pedido:
- Prato: ${dishName}
- Bebida: ${drinkName}
- Sobremesa: ${dessertName}
Total: ${totalPrice}`;

  // Inclui informações do usuário na mensagem, se houver
  const userInfoLabels = { fullname: "Nome", address: "Endereço" };
  let insertedLineFeed = false;

  for (const [key, value] of Object.entries(userInfo)) {
    if (value !== "") {
      if (!insertedLineFeed) {
        message += "\n";
        insertedLineFeed = true;
        console.log("!insertedLineFeed");
      }
      message += `\n${userInfoLabels[key]}: ${value}`;
    }
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

function redirectUser() {
  /* Redireciona o usuário para uma conversa com o restaurante
     contendo uma mensagem pré carregada com o pedido */
  const whatsAppUrl = getWhatsAppUrl();
  window.location.replace(whatsAppUrl);
}

function clearOrderModal() {
  // Limpa as informações do modal com o resumo do pedido
  const modalItems = document.querySelectorAll(".summary-item");
  for (const modalItem of modalItems) {
    if (modalItem.classList.contains("meal")) {
      modalItem.innerHTML = "";
    }
    if (modalItem.classList.contains("total")) {
      modalItem.removeChild(modalItem.lastChild);
    }
  }
}

window.onload = () => {
  // Chame selectItem quando um card é clicado
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("click", selectItem);
  });

  /* Esconda todos os modals ao pressionar qualquer
     botão de Cancelar */
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  for (const cancelButton of cancelButtons) {
    cancelButton.addEventListener("click", () => {
      clearOrderModal();
      hideAllModals();
    });
  }
};
