# Setup
* É necessário a versão LTS do [Node](https://nodejs.org/en/download/) instalada
* Iniciar banco de dados 

```shell
docket-compose up -d db
```
* Instalar dependências

```shell
npm i
```

# Executando testes

```shell
npm test
```


# Executando API

```shell
npm start 
```

_OU_, mudando a variável `DB_HOST` para `db` em `.env` e executando:

```shell
docker-compose up -d api 
```