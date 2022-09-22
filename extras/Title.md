~~~ markdown-script
include '../markdownBookRecipe.mds'


function renderTitlePage()
    title1 = 'The Hobbs Family'
    title2 = 'Cookbook'
    subtitle = '"It\'s your favorite!"'

    # Determine the title image size
    fontSizePx = getDocumentFontSize()
    margin = 1.5 * fontSizePx
    width = getWindowWidth() - 2 * margin
    height = getWindowHeight() - 2 * margin - 4 * fontSizePx

    # Compute the title text size
    titleLineSpacing = height / 8
    maxTitleFontSizePx = titleLineSpacing
    titleFontSizePx = mathMin(maxTitleFontSizePx, getTextHeight(title1, 0.9 * width))
    subtitleFontSizePx = 0.7 * titleFontSizePx
    imageHeight = 2 * titleFontSizePx
    imageWidth = 4 * imageHeight

    # Render the title page
    setDocumentTitle(title1 + ' ' + title2)
    documentReset()
    recipeMenu()
    setDrawingSize(width, height)
    drawStyle('none', 1, 'lawngreen')
    drawRect(0, 0, width, height)
    drawTextStyle(titleFontSizePx, 'black', true)
    drawText(title1, 0.5 * width, 1.5 * titleLineSpacing)
    drawText(title2, 0.5 * width, 2.5 * titleLineSpacing)
    drawTextStyle(subtitleFontSizePx, 'black', true, true)
    drawText(subtitle, 0.5 * width, 0.5 * height)
    drawImage(0.5 * width - 0.5 * imageWidth, 6 * titleLineSpacing - 0.5 * imageHeight, \
        imageWidth, imageHeight, 'TheHobbsFamilyCookbook.png')
    drawOnClick(onImageClick)
    markdownPrint('[Source Code](https://github.com/craigahobbs/hobbs-family-cookbook)')
endfunction


function onImageClick()
    setWindowLocation("#url=ItsYourFavorite.md&var.vCategory='Introduction'")
endfunction


# Render the title page
setWindowResize(renderTitlePage)
renderTitlePage()
~~~
