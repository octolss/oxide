FROM cloudflare/cloudflared:latest

COPY . /etc/cloudflared

CMD ["tunnel", "--config", "/etc/cloudflared/config.yaml", "run"]