# use selenium to call urls in order to download images
import selenium

function downloadImages(urls) {
    for url in urls:
        webdriver.get(url)
}

function initializaWebdriver() {
    webdriver = selenium.webdriver.Chrome()
    return webdriver
}

