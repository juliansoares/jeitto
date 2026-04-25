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

---

## 🔁 Resiliência

* Retry com backoff exponencial
* Timeout de chamadas externas
* Cache com TTL
* Fallback para cache em caso de falha

---

## 🐳 Como rodar local (Minikube)

### Pré-requisitos

* Docker
* Minikube
* kubectl

---

### 1. Iniciar cluster

```bash
minikube start
```

---

### 2. Usar Docker do Minikube

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
```

---

### 7. Testar aplicação

```bash
curl http://<IP>:30007/health
curl http://<IP>:30007/wizard/harry%20potter
```

---

## 📦 Estrutura do projeto

```
.
├── app.js
├── Dockerfile
├── deploy.yaml
├── service.yaml
├── package.json
└── README.md
```

---

## 🧠 Decisões técnicas

* Uso de cache para reduzir dependência externa
* Retry com backoff para evitar falhas transitórias
* Health checks para garantir disponibilidade
* Logs estruturados para facilitar observabilidade
* Deploy com múltiplas réplicas para resiliência

---

## 🚀 Próximos passos (evolução)

* Métricas com Prometheus (`/metrics`)
* Dashboard Grafana
* SLO/SLI definidos
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
