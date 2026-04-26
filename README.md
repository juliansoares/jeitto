# 🚀 SRE Backend Arena

Projeto desenvolvido como solução para o desafio técnico de SRE, com foco em **confiabilidade, observabilidade e boas práticas em Kubernetes**.

---

## 📌 Objetivo

Construir uma API resiliente que consome uma API externa, aplicando práticas de:

* Alta disponibilidade
* Observabilidade
* Resiliência (retry, cache, timeout)
* Deploy em Kubernetes
* Boas práticas de SRE

---

## 🧱 Arquitetura

```
Client → Service (NodePort) → Pods (Deployment) → API Node.js
                                             ↓
                                       External API
```

### Stack utilizada

* Node.js + Express
* Docker
* Kubernetes (Minikube)
* Prometheus
* Grafana
* Axios (HTTP client)
* Cache em memória
---

## ⚙️ Funcionalidades

### 🔮 Endpoint principal

```
GET /wizard/:name
```

* Consulta API externa
* Cache com TTL (60s)
* Retry com backoff
* Timeout configurado
* Retorna origem da resposta (`cache` ou `api`)

---

### ❤️ Health Check

```
GET /health
```

Utilizado para:

* Readiness Probe
* Liveness Probe

---

## ☸️ Kubernetes

### Deployment

* 2 réplicas (alta disponibilidade)
* Rolling update
* Requests e limits de recursos
* Container rodando como **non-root**
* Health checks configurados

### Service

* Tipo: NodePort
* Porta externa: `30007`

---

## 🔍 Health Checks

| Tipo      | Função                                  |
| --------- | --------------------------------------- |
| Readiness | Indica se o pod pode receber tráfego    |
| Liveness  | Reinicia o pod se estiver inconsistente |

---

## 📊 Observabilidade

### Logs estruturados (JSON)

Cada requisição gera logs com:

* timestamp
* correlation_id
* método
* path
* status_code
* duração

### Correlation ID

* Gerado automaticamente por requisição
* Retornado no header e body
* Permite rastreamento end-to-end

### Métricas (Prometheus)

A aplicação expõe métricas em /metrics:

* http_requests_total
* http_request_duration_ms (histograma)
* external_api_errors_total
* cache_hits_total
* cache_misses_total

### Dashboard (Grafana)

Dashboard criado com:

* RPS (Requests por segundo)
* Error Rate
* Latência p95
* Cache hits / misses
* Chamadas à API externa

### 🚨 Alertas (SLO)

Alertas definidos com base em SLO:

* Alta taxa de erro (>1%)
* Latência p95 elevada (>500ms)
* Falhas na API externa
* Ausência de tráfego
* Serviço indisponível (target down)
---

## 🔁 Resiliência

* Retry com backoff exponencial
* Timeout de chamadas externas
* Cache com TTL para reduzir chamadas externas

---
## 🧪 Testes de carga

Utilizado k6 para simulação de carga:

````bash
k6 run --vus 50 --duration 5m load-test.js
````

Permite validar:

* Latência
* Taxa de erro
* Comportamento sob carga
---

## 🐳 Como rodar local (Minikube)

### Pré-requisitos - Instalar

* Docker -> https://docs.docker.com/engine/install/ubuntu/
* Minikube -> https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download
* kubectl -> https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

---

### 1. Iniciar cluster

```bash
minikube start
```

---

### 2. Usar Docker do Minikube
Buildar imagens diretamente no runtime do cluster e evitar push em registry externo

```bash
eval $(minikube docker-env)
```

---

### 3. Build da imagem

```bash
docker build -t sre-arena:1.0 .
```

---

### 4. Deploy no Kubernetes

```bash
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f observability/prometheus-config.yaml  
kubectl apply -f observability/prometheus-deploy.yaml  
kubectl apply -f observability/prometheus-svc.yaml
kubectl apply -f observability/grafana/grafana.yaml
```

---

### 5. Verificar pods

```bash
kubectl get pods
```

---

### 6. Obter IP

```bash
minikube ip
minikube service sre-arena 
minikube service grafana
```

---

### 7. Testar aplicação

```bash
curl http://<IP>:30007/health
curl http://<IP>:30007/wizard/harry%20potter
curl http://<IP>:30007/metrics
```

---

## 📦 Estrutura do projeto

```
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
    ├── prometheus-svc.yaml
    └── grafana/
        └── grafana.yaml
```

---

## 🧠 Decisões técnicas

* Uso de cache para reduzir dependência externa
* Retry com backoff para evitar falhas transitórias
* Health checks para garantir disponibilidade
* Logs estruturados para facilitar observabilidade
* Deploy com múltiplas réplicas para resiliência

---

## 🚀 Próximos passos (PENDENTE)

* Circuit breaker
* Rate limiting client-side
* CI/CD com GitHub Actions
* Testes automatizados (>=70% coverage)

---

## 🏁 Conclusão

O projeto demonstra a aplicação prática de conceitos de SRE:

* Observabilidade
* Confiabilidade
* Escalabilidade
* Boas práticas em Kubernetes

---

## 👨‍💻 Autor

Julian Soares
SRE | Cloud | Kubernetes
