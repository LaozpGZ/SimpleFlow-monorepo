# BE Doc

# API

Endpoint: NEXT_PUBCLIC_GIFT_API

## Query gifts code

```jsx
GET /gift/list?chainId=97&address?=0xadsa...
```

Return body

```jsx
{
	"status": "success" | "failed",
	"message": string, // if status is failed
	"data": [
		{
        "codeHash": string,
        "token": string,
        "tokenAmount": string,
        "nativeAmount": string,
        "createTransactionHash": string,
        "status": "PENDING" | "CLAIMED" | "EXPIRED" | "REQUESTED_CLAIM" | "CANCELLED"
        "claimerAddress": string | null,
        "actionTransactionHash": string | null, // the transaction for ClAIMED/EXPIRED/CANCELLED
        "timestamp": ISOString
		}
	]
}
```

## Query specific gift code

```jsx
GET /gift?chainId=97&codeHash?=0xadsa...
```

Return body

```jsx
{
	"status": "success" | "failed",
	"message": string, // if status is failed
	"data": {
        "codeHash": string,
        "token": string,
        "tokenAmount": string,
        "nativeAmount": string,
        "createTransactionHash": string,
        "status": "PENDING" | "CLAIMED" | "EXPIRED" | "REQUESTED_CLAIM" | "CANCELLED"
        "claimerAddress": string | null,
        "actionTransactionHash": string | null,// the transaction for ClAIMED/EXPIRED/CANCELLED
        "timestamp": ISOString
	}
}
```

## Claim gift code

```jsx
POST / api / gift / claim
```

POST body

```json
{
	"chainId": number,
	"address": string, // claimer address
	"code": string // sensitive info
}
```

Return body

```json
{
	"status": "success" | "failed",
	"message": string // if status is failed
	"data": {
		"codeHash": string
	}
}
```
