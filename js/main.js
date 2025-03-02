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
	document.body.classList.add('lock-body');
	if (main && footer) {
		main.classList.add('hide-layer');
		footer.classList.add('hide-layer');
	}
}
function bodyUnlock() {
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
	productsData.forEach(({ imagePath, name, type, price, cardColor }) => {
		const productCard = `
					<li class="products__item">
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
loadProducts();

// iziModal settings

$('#popup-thanks').iziModal({
	closeButton: false,
	// overlayColor: 'rgba(174, 19, 50, 0.3)',
	// overlayColor: '',
	bodyOverflow: true,
	background: false
});
$('.open-popup-thanks').click(function (e) {
	e.preventDefault();
	const emailInput = document.getElementById('quick-order-useremail');
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (!emailRegex.test(emailInput.value.trim())) {
		alert('Please enter a valid email.');
		return false;
	}

	$('#popup-thanks').iziModal('open');
});
