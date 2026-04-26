#!/bin/bash

URL="http://192.168.58.2:30007/wizard"

wizards=(
  "harry potter"
  "hermione granger"
  "ron weasley"
  "albus dumbledore"
)

while true; do
  for wizard in "${wizards[@]}"; do
    encoded=$(echo "$wizard" | sed 's/ /%20/g')

    echo "🔮 $wizard"
    curl -s -w "\n⏱️ Time: %{time_total}s | Status: %{http_code}\n" "$URL/$encoded"

    echo "----------------------"
    sleep 2
  done
done
