🚀 SRE Backend Arena

Projeto desenvolvido como solução para o desafio técnico de SRE, com foco em confiabilidade, observabilidade e resiliência em ambientes distribuídos utilizando Kubernetes.

📌 Objetivo

Construir uma API resiliente que consome uma API externa, aplicando práticas de:

Alta disponibilidade
Observabilidade
Resiliência (retry, cache, timeout)
Deploy em Kubernetes
Boas práticas de SRE
🧱 Arquitetura
Client → Service (NodePort – acesso externo) → Pods (Deployment) → API Node.js
                                                            ↓
                                                     External API
🧰 Stack utilizada
Node.js + Express
Docker
Kubernetes (Minikube)
Prometheus
Grafana
Axios (HTTP client)
Cache em memória
⚙️ Funcionalidades
🔮 Endpoint principal
GET /wizard/:name
Consome API externa
Cache com TTL (60s)
Retry com backoff exponencial
Timeout configurado
Retorna origem da resposta (cache ou api)
❤️ Health Check
GET /health

Utilizado para:

Readiness Probe
Liveness Probe
☸️ Kubernetes
Deployment
2 réplicas (alta disponibilidade)
Rolling Update configurado
Requests e Limits de recursos
Container rodando como non-root
Health checks (readiness e liveness)
Service
Tipo: NodePort
Porta externa: 30007
🔍 Health Checks
Tipo	Função
Readiness	Indica se o pod pode receber tráfego
Liveness	Reinicia o pod se estiver inconsistente
📊 Observabilidade
📈 Métricas (Prometheus)

A aplicação expõe métricas em /metrics:

http_requests_total
http_request_duration_ms (histograma)
external_api_errors_total
cache_hits_total
cache_misses_total
📊 Dashboard (Grafana)

Dashboard criado com:

RPS (Requests por segundo)
Error Rate
Latência p95
Cache hits / misses
Chamadas à API externa
🚨 Alertas (SLO)

Alertas baseados em SLO foram definidos:

Alta taxa de erro (> 1%)
Latência p95 elevada (> 500ms)
Falhas na API externa
Ausência de tráfego
Serviço indisponível (target down)
🧾 Logs estruturados

Cada requisição gera logs JSON contendo:

timestamp
correlation_id
método
path
status_code
duração
🔗 Correlation ID
Gerado automaticamente por requisição
Retornado no header e body
Permite rastreamento end-to-end
🔁 Resiliência
Retry com backoff exponencial
Timeout de chamadas externas
Cache com TTL para reduzir dependência externa
🧪 Testes de carga

Utilizado k6 para simulação de carga:

k6 run --vus 50 --duration 5m load-test.js

Permite validar:

Latência
Taxa de erro
Comportamento sob carga
🐳 Como rodar local (Minikube)
Pré-requisitos
Docker
Minikube
kubectl
1. Iniciar cluster
minikube start
2. Usar Docker do Minikube
eval $(minikube docker-env)

Permite buildar imagens direto no cluster.

3. Build da imagem
docker build -t sre-arena:1.0 .
4. Deploy no Kubernetes
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/service.yaml

kubectl apply -f observability/prometheus-config.yaml
kubectl apply -f observability/prometheus-deploy.yaml
kubectl apply -f observability/prometheus-svc.yaml
5. Verificar pods
kubectl get pods
6. Obter IP
minikube ip
minikube service sre-arena
7. Testar aplicação
curl http://<IP>:30007/health
curl http://<IP>:30007/wizard/harry%20potter
curl http://<IP>:30007/metrics
📦 Estrutura do projeto
.
├── app.js
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── load-test.js
├── script.sh
├── k8s/
│   ├── deploy.yaml
│   └── service.yaml
└── observability/
    ├── prometheus-config.yaml
    ├── prometheus-deploy.yaml
    └── prometheus-svc.yaml
🧠 Decisões técnicas
Uso de cache para reduzir dependência externa
Retry com backoff para falhas transitórias
Health checks para garantir disponibilidade
Logs estruturados para facilitar troubleshooting
Métricas e alertas para observabilidade completa
Deploy com múltiplas réplicas para alta disponibilidade
🚀 Próximos passos
Implementar circuit breaker
Rate limiting client-side
CI/CD com GitHub Actions
Testes automatizados (>=70% coverage)
🏁 Conclusão

O projeto demonstra na prática:

Observabilidade completa
Confiabilidade e resiliência
Escalabilidade em Kubernetes
Boas práticas de SRE
👨‍💻 Autor

Julian Soares
SRE | Cloud | Kubernetes
