#
# Makefile for cropping and resizing recipe images.
#
# Requires ImageMagick command line tools.
#


.PHONY: help
help:
	@echo make [resize]


# Destination image size
SIZE := 240x240


# Helper function to generate image resize rules - w%, h%, x%, y%, original
define RESIZE
.PHONY: resize-$(strip $(5))
resize-$(strip $(5)):
	convert $(strip $(5)) \
-crop $(strip $(1))%x$(strip $(2))`identify -format '+%[fx:w*$(strip $(3))/100]+%[fx:h*$(strip $(4))/100]' $(strip $(5))` \
-resize $(SIZE) ../$(strip $(5))

.phony: resize
resize: resize-$(strip $(5))
endef


# Resize rules
$(eval $(call RESIZE, 100, 100,  0,  0, BaileysChocolateChipCheesecake.jpg))
$(eval $(call RESIZE,  95,  80,  5, 10, BananaNutBread.jpg))
$(eval $(call RESIZE, 100,  80,  0, 12, BeefStirfry.jpg))
$(eval $(call RESIZE,  90,  70,  0, 10, BerryCrisp.jpg))
$(eval $(call RESIZE,  95,  65,  5, 20, CarrotCakeWithLemonFrosting.jpg))
$(eval $(call RESIZE,  90,  60,  4, 20, ChocolateDecadence.jpg))
$(eval $(call RESIZE,  95,  65,  5, 15, DillyBread.jpg))
$(eval $(call RESIZE, 100,  60,  0, 20, DutchBabies.jpg))
$(eval $(call RESIZE,  95,  65,  0, 25, ExtraordinaryChocolateChipCookies.jpg))
$(eval $(call RESIZE, 100, 100,  0,  0, HotCabbageSalad.jpg))
$(eval $(call RESIZE, 100, 100,  0,  0, HummingbirdCake.jpg))
$(eval $(call RESIZE, 100, 100,  0,  0, MomsCoffeeCake.jpg))
$(eval $(call RESIZE, 100, 100,  0,  0, RosellinisSummerPastaSalad.jpg))
$(eval $(call RESIZE,  85,  95,  0,  5, Stromboli.jpg))
$(eval $(call RESIZE,  95,  80,  5,  5, Tiramisu.jpg))
