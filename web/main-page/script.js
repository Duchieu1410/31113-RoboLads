/* 1. Hiệu ứng gõ chữ Hero Section (HSGS ROBOLADS) */
const texts = [
    { el: document.getElementById("line1"), text: "HSGS" },
    { el: document.getElementById("line2"), text: "ROBOLADS" }
];

const speed = 150;
const cursor = document.createElement("span");
cursor.className = "cursor";

let lineIndex = 0;
let charIndex = 0;

function typeHero() {
    if (lineIndex >= texts.length) {
        cursor.remove();
        startAboutTyping();
        return;
    }

    const current = texts[lineIndex];
    current.el.appendChild(cursor);

    if (charIndex < current.text.length) {
        cursor.insertAdjacentText("beforebegin", current.text[charIndex]);
        charIndex++;
        setTimeout(typeHero, speed);
    } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeHero, 400);
    }
}

/* 2. Hiệu ứng gõ chữ About Section (ABOUT ROBOLADS) */
const aboutText = "ABOUT\nROBOLADS";
const aboutTarget = document.getElementById("about-typewriter");
let aboutIndex = 0;

function startAboutTyping() {
    if (!aboutTarget) return;
    aboutTarget.appendChild(cursor);
    typeAbout();
}

function typeAbout() {
    if (aboutIndex < aboutText.length) {
        cursor.insertAdjacentText("beforebegin", aboutText.charAt(aboutIndex));
        aboutIndex++;
        setTimeout(typeAbout, 120);
    } else {
        cursor.remove();
    }
}

/* 3. Hàm cuộn mượt đến Section mục tiêu */
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/* 4. Khởi chạy khi load xong tài nguyên */
window.addEventListener("load", () => setTimeout(typeHero, 500));
/* ------------------------------------------- */
/* 4. Xử lý hiệu ứng Active cho Accordion Cards */
/* ------------------------------------------- */
const activityCards = document.querySelectorAll('.activity-card');

activityCards.forEach(card => {
    // Khi rê chuột vào thẻ nào, chuyển active sang thẻ đó
    card.addEventListener('mouseenter', () => {
        activityCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});
/* ------------------------------------------- */
/* Xử lý tương tác Accordion Cards             */
/* ------------------------------------------- */
const accordionContainer = document.querySelector('.cards-accordion');
const cards = document.querySelectorAll('.activity-card');

if (accordionContainer && cards.length > 0) {
    cards.forEach(card => {
        // Rê chuột vào: Kích hoạt thẻ và hiện ảnh
        card.addEventListener('mouseenter', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    // Rời chuột khỏi cả vùng: Trở về giao diện thẻ ngang ban đầu
    accordionContainer.addEventListener('mouseleave', () => {
        cards.forEach(c => c.classList.remove('active'));
    });
}