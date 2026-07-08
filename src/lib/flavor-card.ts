import type { Address } from "viem";

export const MAX_TITLE_LENGTH = 36;
export const MAX_FLAVOR_LENGTH = 18;
export const MAX_INGREDIENTS_LENGTH = 180;
export const MAX_STEPS_LENGTH = 220;
export const MAX_NOTE_LENGTH = 90;

export const flavorCardAbi = [
  {
    type: "event",
    name: "CardCreated",
    inputs: [
      { name: "cardId", type: "uint256", indexed: true },
      { name: "cook", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false },
      { name: "flavor", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "createCard",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "flavor", type: "string" },
      { name: "ingredients", type: "string" },
      { name: "steps", type: "string" },
      { name: "servingNote", type: "string" },
    ],
    outputs: [{ name: "cardId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getCard",
    stateMutability: "view",
    inputs: [{ name: "cardId", type: "uint256" }],
    outputs: [
      { name: "cook", type: "address" },
      { name: "title", type: "string" },
      { name: "flavor", type: "string" },
      { name: "ingredients", type: "string" },
      { name: "steps", type: "string" },
      { name: "servingNote", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextCardId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredFlavorCardContractAddress =
  process.env.NEXT_PUBLIC_FLAVOR_CARD_CONTRACT_ADDRESS?.trim();

export const flavorCardContractAddress = isAddressLike(
  configuredFlavorCardContractAddress,
)
  ? (configuredFlavorCardContractAddress as Address)
  : undefined;
