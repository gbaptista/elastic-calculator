build:
	yarn run eslint --ext .js,.vue assets/javascripts --fix

	yarn run webpack \
		--env.ENV=production \
		--env.NODE_ENV=production \
		--env.DEV_TOOL=

# 	yarn run webpack \
# 		--env.ENV=development \
# 		--env.NODE_ENV=development \
# 		--env.DEV_TOOL=inline-source-map

watch:
		. ./watch.sh
