# replace footinbill-api with your own tag
docker buildx build --platform linux/amd64 -t footinbill-api .

# make sure to use the name of your Heroku app
docker tag footinbill-api registry.heroku.com/footinbill-api/web

# use docker push to push it to the Heroku registry
docker push registry.heroku.com/footinbill-api/web

# then use heroku release to activate
heroku container:release web -a footinbill-api