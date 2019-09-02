inotifywait -e close_write -r ./assets/javascripts |
while read -r directory events filename; do
  clear;
  printf "\nUpdating $directory$filename\n\n"

  make build

  printf "\n"

  make watch
done
