'use strict';
const mediaQueryMobile = window.matchMedia('(max-width: 767px)');
//lock body after the mobile menu appeared
const menuSwitcher = document.getElementById('menu-switch');
const mobileMenu = document.querySelector('.mobile-menu__wrapper');
const linkToMobileMenu = document.querySelector('.link-to-mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');

menuSwitcher.addEventListener('change', (e) => {
	if (e.target.checked) {
		bodyLock();
		menuSwitcher.labels[0].title = 'close';
	} else if (!e.target.checked) {
		bodyUnlock();
		menuSwitcher.labels[0].title = 'mobile menu';
	}
});
linkToMobileMenu.addEventListener('click', (e) => {
	if (mediaQueryMobile.matches) {
		menuSwitcher.checked = true;
		bodyLock();
	}
});
mobileMenu.addEventListener('click', (e) => {
	menuSwitcher.checked = false;
	bodyUnlock();
});

function bodyLock() {
	const lockPaddingValue = window.innerWidth - document.querySelector('body').offsetWidth + "px";
	document.body.style.paddingRight = lockPaddingValue;
	document.body.classList.add('lock-body');
	if (main && footer) {
		main.classList.add('hide-layer');
		footer.classList.add('hide-layer');
	}
}
function bodyUnlock() {
	document.body.style.paddingRight = '0px';
	document.body.classList.remove('lock-body');
	if (main && footer) {
		function visibleLayer() {
			main.classList.remove('hide-layer');
			footer.classList.remove('hide-layer');
		}

		setTimeout(visibleLayer, 200);
	}
}

// for section products
const productsBox = document.querySelector('.products__list');

async function loadProducts() {
	let productsData;
	try {
		const response = await fetch('./data/products.json');
		productsData = await response.json();
	} catch (error) {
		console.error('Ошибка:', error);
	}
	productsData.forEach(({ imagePath, name, type, price, cardColor, id }) => {
		const productCard = `
					<li class="products__item" data-product-id="${id}" data-product-color="${cardColor}">
						<article class="product-card" style="background-color:${cardColor}">
							<h3 class="product-card__name">${name}</h3>
							<span class="product-card__type">${type}</span>
							<div class="product-card__image-wrapper">
								<img class="product-card__image" src="${imagePath}" alt="${name}" width="295"
									height="251">
							</div>
	
							<div class="product-card__price button">
								${price}&nbsp;UAH&nbsp;/ kg
							</div>
						</article>
					</li>
		`;
		productsBox.insertAdjacentHTML('beforeend', productCard);
	});
}
async function loadSpecialProducts() {
	let specialProductsData;
	if (localStorage.getItem('cart') === null || localStorage.getItem('cart') === '[]') {
		try {
			const response = await fetch('./data/special-offer.json');
			specialProductsData = await response.json();
		} catch (error) {
			console.error('Error:', error);
			return;
		}
		specialProductsData.forEach(product => {
			cartItems.push(product);
		});
		saveCartToLocalStorage(cartItems);
	}
	updateCartDisplay();
}

loadProducts();

// iziModal settings

// initialization iziModal windows
$('#popup-thanks').iziModal({
	bodyOverflow: true,
	background: false
});
$('#popup-user-order').iziModal({
	background: false,
	bodyOverflow: true,
	width: ''
});
// For user card form
const cardNumberField = document.getElementById('cc-number');
// added mask of user card imput
cardNumberField.addEventListener('input', function () {
	const value = this.value.replace(/\D/g, '');
	const formattedValue = formatCardNumber(value);
	this.value = formattedValue;
});

function formatCardNumber(value) {
	const parts = [];
	for (let i = 0; i < value.length; i += 4) {
		parts.push(value.slice(i, i + 4));
	}
	return parts.join(' ').trim();
}
// opening modal windows
$('.open-popup-thanks').click(function (e) {
	e.preventDefault();
	const emailInput = document.getElementById('quick-order-useremail');

	if (!emailInput.validity.valid) {
		emailInput.reportValidity();
		return;
	}

	// If there is a server to send data
	// fetch('/your-server-url', {
	// 	method: 'POST',
	// 	body: new FormData(document.getElementById('quick-order-form'))
	// })
	// 	.then((response) => response.json())
	// 	.then((data) => {
	// 		$('#popup-thanks').iziModal('open');
	// 	})
	// 	.catch((error) => console.error('Error:', error));
	$('#popup-thanks').iziModal('open');

	// Simulate sending data (page refresh)

	$('#popup-thanks').on('closed', function () {
		location.reload();
	});
});

$('.open-popup-user-order').click(function (e) {
	$('#popup-user-order').iziModal('open');
});

$('#user-order-form').on('submit', function (e) {
	e.preventDefault();
	if (!this.checkValidity()) {
		this.reportValidity();
		return;
	}
	if (cartItems.length === 0) {
		alert('Cart is empty! Please add items to checkout..');
		return; // Stop submit if it's empty
	}
	const checkboxes = document.querySelectorAll('input[name="products[]"]:checked');
	const selectedCartItems = [];
	checkboxes.forEach(checkbox => {
		const productId = checkbox.value;
		const selectedItem = cartItems.find(item => String(item.id) === productId);
		if (selectedItem) {
			selectedCartItems.push(selectedItem);
		}
	});
	let orderString = "You ordere:\n";
	selectedCartItems.forEach(item => {
		orderString += "- " + item.name + "\n";// Add a product name and a newline
	});

	alert(orderString);
	localStorage.removeItem('cart');
	cartItems = [];
	updateCartDisplay();


	// If there is a server to send data
	// fetch('/your-server-url', {
	// 	method: 'POST',
	// 	body: new FormData(document.getElementById('user-order-form'))
	// })
	// 	.then((response) => response.json())
	// 	.then((data) => {
	// 		$('#popup-thanks').iziModal('open');
	// 	})
	// 	.catch((error) => console.error('Error:', error));
	$('#popup-user-order').iziModal('close');

	$('#popup-user-order').on('closed', function () {
		$('#popup-thanks').iziModal('open');
	});
	bodyLock();

	// Simulate sending data (page refresh)
	$('#popup-thanks').on('closed', function () {
		location.reload();
	});
});


// formation of a basket of goods
const cartList = document.querySelector('.cart-list');
const basketCounter = document.querySelector('.basket__counter');
const basketCounterMobile = document.querySelector('.basket__counter');

let defaultProductsCount = 0;
let cartItems = loadCartFromLocalStorage();

let basketDefaultProductsCounter = cartList.querySelectorAll('.user-purchase--default').length;

document.addEventListener('DOMContentLoaded', function () {
	updateCartDisplay();
	loadSpecialProducts();
});

productsBox.addEventListener('click', (e) => {
	const productItem = e.target.closest('.products__item');
	if (productItem) {
		const productData = getProductData(productItem);
		cartItems.push(productData);
		saveCartToLocalStorage(cartItems);
		updateCartDisplay();
		alert("The product has been added to your cart.");
	}
});

function deleteDefaultProducts() {
	const cartData = localStorage.getItem('cart');

	if (cartData) {
		const defaultProducts = cartList.querySelectorAll('.user-purchase--default');
		if (defaultProducts.length > 0) {
			defaultProducts.forEach(product => {
				product.remove();
			});
		}
	}
}

// Product data collection function
function getProductData(productItem) {
	const productName = productItem.querySelector('.product-card__name').textContent;
	const productType = productItem.querySelector('.product-card__type').textContent;
	const productImage = productItem.querySelector('.product-card__image').src;
	const productId = productItem.dataset.productId;
	const productColorCard = productItem.dataset.productColor;

	return {
		id: productId,
		name: productName,
		type: productType,
		image: productImage,
		cardColor: productColorCard
	};
}

// Function for saving an array of product data in localStorage
function saveCartToLocalStorage(cartItems) {
	localStorage.setItem('cart', JSON.stringify(cartItems));
}
// Data unloading function from localStorage
function loadCartFromLocalStorage() {
	const cartData = localStorage.getItem('cart');
	try {
		return cartData ? JSON.parse(cartData) : [];
	} catch (error) {
		console.error("Ошибка при разборе JSON из localStorage:", error);
		return [];
	}
}

// Updating the shopping cart
function updateCartDisplay() {
	const cartData = localStorage.getItem('cart');

	if (!cartData) {
		return;
	}
	console.log(cartItems);
	cartList.innerHTML = '';
	cartItems.forEach(product => {
		const productCard = `
			<li class="cart-list__item user-purchase" style="background-color:${product.cardColor}" data-product-id="${product.id}">
				<label class="visually-hidden" for="product1">Product ${product.name}</label>
				<input class="user-purchase__choice" type="checkbox" id="product-${product.id}" name="products[]" value="${product.id}"
					form="user-order-form" checked>
				<h4 class="visually-hidden">User's procuct description</h4>
				<div class="user-purchase__header">
					<h5 class="user-purchase__name">${product.name}</h5>
					<span class="user-purchase__type">${product.type}</span>
				</div>
				<img class="user-purchase__image" src="${product.image}"
					alt="${product.name}" width="173" height="196">
			</li>
		`;
		cartList.insertAdjacentHTML('beforeend', productCard);
	});
	// Update the counter
	basketCounter.textContent = cartItems.length;

	basketCounterMobile.textContent = cartItems.length;
}

// function remove products from user cart
cartList.addEventListener('click', (e) => {
	const productItem = e.target.closest('.cart-list__item');

	if (productItem && !e.target.classList.contains('user-purchase__choice') && !productItem.classList.contains('user-purchase--default')) {
		const productID = productItem.dataset.productId;
		console.log(productID);
		const confirmation = confirm("Are you sure you want to remove this item from your cart?");
		if (confirmation) {
			const indexToRemove = cartItems.findIndex(item => String(item.id) === productID);
			// Remove the product from the array
			if (indexToRemove !== -1) {
				cartItems.splice(indexToRemove, 1);
				saveCartToLocalStorage(cartItems);
				updateCartDisplay();
			}
		}
	}
});