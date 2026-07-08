"use client";

import {
  BookOpen,
  ChefHat,
  Clock3,
  Flame,
  Leaf,
  Loader2,
  Search,
  Sparkles,
  Utensils,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  flavorCardAbi,
  flavorCardContractAddress,
  MAX_FLAVOR_LENGTH,
  MAX_INGREDIENTS_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_STEPS_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/flavor-card";

const FLAVORS = ["Bright", "Smoky", "Fresh", "Sweet"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "--";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid title")) return "Title needs 1 to 36 characters.";
  if (error.message.includes("Invalid flavor")) return "Choose a short flavor tag.";
  if (error.message.includes("Invalid ingredients")) return "Ingredients need 1 to 180 characters.";
  if (error.message.includes("Invalid steps")) return "Steps need 1 to 220 characters.";
  return error.message;
}

function FlavorPreview({
  title,
  flavor,
  ingredients,
  steps,
  servingNote,
  cook,
  createdAt,
}: {
  title: string;
  flavor: string;
  ingredients: string;
  steps: string;
  servingNote: string;
  cook?: Address;
  createdAt?: bigint;
}) {
  const accent =
    flavor === "Smoky"
      ? "bg-[#2d1b16] text-[#ff9b6d] border-[#ff9b6d]"
      : flavor === "Fresh"
        ? "bg-[#15351f] text-[#75d98b] border-[#75d98b]"
        : flavor === "Sweet"
          ? "bg-[#3f1e32] text-[#ff92c8] border-[#ff92c8]"
          : "bg-[#f4d35e] text-[#201711] border-[#201711]";

  return (
    <article className="relative overflow-hidden rounded-[8px] border border-[#251a13] bg-[#fff9ed] text-[#201711] shadow-[0_28px_90px_rgba(48,29,16,0.28)]">
      <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#f4d35e]" />
      <div className="absolute bottom-[-95px] left-[-65px] h-52 w-52 rounded-full bg-[#dd5d3d]" />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-black uppercase text-[#9a4c2e]">
              Flavor Card
            </p>
            <h2 className="mt-3 max-w-[680px] break-words text-5xl font-black leading-none sm:text-7xl">
              {title || "Untitled bite"}
            </h2>
          </div>
          <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-[8px] border-2 ${accent}`}>
            <ChefHat className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className={`rounded-full border px-4 py-2 text-sm font-black ${accent}`}>
            {flavor}
          </span>
          <span className="rounded-full border border-[#251a13] bg-[#201711] px-4 py-2 text-sm font-black text-[#fff9ed]">
            On Base
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[8px] border-2 border-[#251a13] bg-[#f7ead2] p-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-[#dd5d3d]" />
              <h3 className="text-xl font-black">Ingredients</h3>
            </div>
            <p className="mt-3 min-h-[118px] whitespace-pre-wrap text-lg font-bold leading-8">
              {ingredients || "Add the tiny pantry list."}
            </p>
          </section>
          <section className="rounded-[8px] border-2 border-[#251a13] bg-[#fdf1da] p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#dd5d3d]" />
              <h3 className="text-xl font-black">Three steps</h3>
            </div>
            <p className="mt-3 min-h-[118px] whitespace-pre-wrap text-lg font-bold leading-8">
              {steps || "Write the prep, cook, and finish steps."}
            </p>
          </section>
        </div>

        <div className="mt-4 rounded-[8px] border-2 border-[#251a13] bg-[#201711] p-4 text-[#fff9ed]">
          <p className="font-mono text-[11px] font-black uppercase text-[#f4d35e]">
            Serving note
          </p>
          <p className="mt-2 text-lg font-black">
            {servingNote || "Best shared while it is still warm."}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#251a13] bg-[#fff9ed] p-3">
            <p className="font-mono text-[10px] font-black uppercase text-[#9a4c2e]">
              Cook
            </p>
            <p className="mt-1 text-xl font-black">{shortAddress(cook)}</p>
          </div>
          <div className="rounded-[8px] border border-[#251a13] bg-[#fff9ed] p-3">
            <p className="font-mono text-[10px] font-black uppercase text-[#9a4c2e]">
              Created
            </p>
            <p className="mt-1 text-xl font-black">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FlavorCardApp() {
  const [cardIdInput, setCardIdInput] = useState("1");
  const [title, setTitle] = useState("Lemon Chili Toast");
  const [flavor, setFlavor] = useState<(typeof FLAVORS)[number]>("Bright");
  const [ingredients, setIngredients] = useState("Sourdough, lemon zest, chili oil, soft cheese, flaky salt");
  const [steps, setSteps] = useState("Toast bread hard. Spread soft cheese. Finish with lemon zest, chili oil, and salt.");
  const [servingNote, setServingNote] = useState("A fast snack with a clean little kick.");
  const [status, setStatus] = useState("Create a tiny recipe card and save it on Base.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContractAsync,
    isPending: writing,
  } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedCardId = BigInt(Math.max(1, Number(cardIdInput || "1")));

  const cardQuery = useReadContract({
    abi: flavorCardAbi,
    address: flavorCardContractAddress,
    functionName: "getCard",
    args: [parsedCardId],
    query: {
      enabled: Boolean(flavorCardContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: flavorCardAbi,
    address: flavorCardContractAddress,
    functionName: "nextCardId",
    query: {
      enabled: Boolean(flavorCardContractAddress),
      refetchInterval: 12000,
    },
  });

  const tuple = cardQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveCard = useMemo(
    () =>
      tuple
        ? {
            cook: tuple[0],
            title: tuple[1],
            flavor: tuple[2],
            ingredients: tuple[3],
            steps: tuple[4],
            servingNote: tuple[5],
            createdAt: tuple[6],
          }
        : undefined,
    [tuple],
  );

  const totalCards = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    flavor.trim().length > 0 &&
    flavor.trim().length <= MAX_FLAVOR_LENGTH &&
    ingredients.trim().length > 0 &&
    ingredients.trim().length <= MAX_INGREDIENTS_LENGTH &&
    steps.trim().length > 0 &&
    steps.trim().length <= MAX_STEPS_LENGTH &&
    servingNote.trim().length <= MAX_NOTE_LENGTH;

  const createBlocker = !flavorCardContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_FLAVOR_CARD_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill title, flavor, ingredients, and steps."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;

    void totalQuery.refetch();
    void cardQuery.refetch();

    const logs = parseEventLogs({
      abi: flavorCardAbi,
      logs: receipt.logs,
      eventName: "CardCreated",
    });
    const cardId = logs[0]?.args.cardId;

    window.setTimeout(() => {
      if (cardId) setCardIdInput(cardId.toString());
      setStatus(
        cardId
          ? `Flavor Card #${cardId.toString()} saved on Base.`
          : "Flavor Card saved on Base. Load the newest Card ID.",
      );
    }, 0);
  }, [cardQuery, lastAction, receipt, totalQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> =>
        Boolean(connector),
      )
      .filter(
        (connector, index, queue) =>
          queue.findIndex((item) => item.id === connector.id) === index,
      );

    if (connectorQueue.length === 0) {
      setStatus("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setStatus("Opening wallet connection...");

    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setStatus("Wallet connected. Save a Flavor Card when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }

    setStatus(friendlyError(lastError));
  }

  async function createCard() {
    const contractAddress = flavorCardContractAddress;

    if (createBlocker) {
      setStatus(createBlocker);
      return;
    }

    if (!contractAddress) {
      setStatus("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }

    try {
      setLastAction("create");
      setStatus("Confirm your Flavor Card in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: flavorCardAbi,
        functionName: "createCard",
        args: [
          title.trim(),
          flavor.trim(),
          ingredients.trim(),
          steps.trim(),
          servingNote.trim(),
        ],
        chainId: base.id,
      });
      setStatus("Flavor Card sent. Waiting for Base confirmation...");
    } catch (error) {
      setStatus(friendlyError(error));
    }
  }

  const previewTitle = liveCard?.title || title;
  const previewFlavor = liveCard?.flavor || flavor;
  const previewIngredients = liveCard?.ingredients || ingredients;
  const previewSteps = liveCard?.steps || steps;
  const previewNote = liveCard?.servingNote ?? servingNote;

  return (
    <main className="min-h-screen bg-[#f5efe3] text-[#201711]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] p-4 shadow-[0_20px_80px_rgba(48,29,16,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase text-[#9a4c2e]">
                Flavor Card
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none">
                Mint a tiny recipe.
              </h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border-2 border-[#251a13] bg-[#f4d35e]">
              <ChefHat className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border-2 border-[#251a13] bg-[#f7ead2] p-3">
              <p className="font-mono text-[10px] font-black uppercase text-[#9a4c2e]">
                Cards
              </p>
              <p className="mt-2 text-3xl font-black">{totalCards}</p>
            </div>
            <div className="rounded-[8px] border-2 border-[#251a13] bg-[#201711] p-3 text-[#fff9ed]">
              <p className="font-mono text-[10px] font-black uppercase text-[#f4d35e]">
                Chain
              </p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[8px] border-2 border-[#251a13] bg-[#fdf1da] p-4">
            <h2 className="text-xl font-black">New card</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Recipe title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={MAX_TITLE_LENGTH}
                  className="mt-1 w-full rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-3 py-3 font-black outline-none"
                />
              </label>

              <div>
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Flavor
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {FLAVORS.map((value) => (
                    <button
                      key={value}
                      className={`rounded-[8px] border-2 px-2 py-3 text-sm font-black ${
                        value === flavor
                          ? "border-[#251a13] bg-[#dd5d3d] text-[#fff9ed]"
                          : "border-[#251a13] bg-[#fff9ed]"
                      }`}
                      onClick={() => setFlavor(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Ingredients
                </span>
                <textarea
                  value={ingredients}
                  onChange={(event) => setIngredients(event.target.value)}
                  maxLength={MAX_INGREDIENTS_LENGTH}
                  rows={3}
                  className="mt-1 w-full rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Steps
                </span>
                <textarea
                  value={steps}
                  onChange={(event) => setSteps(event.target.value)}
                  maxLength={MAX_STEPS_LENGTH}
                  rows={4}
                  className="mt-1 w-full rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Serving note
                </span>
                <input
                  value={servingNote}
                  onChange={(event) => setServingNote(event.target.value)}
                  maxLength={MAX_NOTE_LENGTH}
                  className="mt-1 w-full rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-3 py-3 font-bold outline-none"
                />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#251a13] bg-[#f4d35e] px-4 py-3 font-black disabled:opacity-60"
                disabled={switching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#251a13] bg-[#dd5d3d] px-4 py-3 font-black text-[#fff9ed] disabled:opacity-60"
                disabled={writing || confirming}
                onClick={createCard}
              >
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Save Flavor Card
              </button>
            )}

            {isConnected ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-4 py-3 font-black"
                onClick={disconnectWallet}
              >
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#251a13] bg-[#201711] px-4 py-3 font-black text-[#fff9ed] disabled:opacity-60"
                disabled={!selectedConnector || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}

            <p className="rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] px-3 py-3 text-sm font-bold leading-6">
              {status}
            </p>
            {hash ? (
              <a
                className="block rounded-[8px] border-2 border-[#251a13] bg-[#201711] px-3 py-3 text-xs font-black leading-5 text-[#f4d35e] underline"
                href={`https://basescan.org/tx/${hash}`}
                rel="noreferrer"
                target="_blank"
              >
                View transaction on BaseScan
              </a>
            ) : null}
            {createBlocker && isConnected ? (
              <p className="rounded-[8px] border-2 border-[#251a13] bg-[#f7ead2] px-3 py-3 text-xs font-bold leading-5">
                {createBlocker}
              </p>
            ) : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <FlavorPreview
            title={previewTitle}
            flavor={previewFlavor}
            ingredients={previewIngredients}
            steps={previewSteps}
            servingNote={previewNote}
            cook={liveCard?.cook}
            createdAt={liveCard?.createdAt}
          />

          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h2 className="text-2xl font-black">Load card</h2>
              </div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                  Card ID
                </span>
                <input
                  value={cardIdInput}
                  onChange={(event) =>
                    setCardIdInput(event.target.value.replace(/\D/g, ""))
                  }
                  className="mt-1 w-full rounded-[8px] border-2 border-[#251a13] bg-[#fdf1da] px-3 py-3 text-2xl font-black outline-none"
                />
              </label>
            </div>

            <div className="rounded-[8px] border-2 border-[#251a13] bg-[#fff9ed] p-4">
              <p className="font-mono text-[11px] font-black uppercase text-[#9a4c2e]">
                What it does
              </p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6">
                Flavor Card turns a tiny recipe into an onchain card with title,
                flavor, ingredients, steps, cook wallet, and timestamp.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#251a13] bg-[#f7ead2] px-3 py-2 text-xs font-black">
                  <Flame className="h-4 w-4 text-[#dd5d3d]" /> Flavor tag
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#251a13] bg-[#f7ead2] px-3 py-2 text-xs font-black">
                  <Clock3 className="h-4 w-4 text-[#dd5d3d]" /> Timestamp
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#251a13] bg-[#f7ead2] px-3 py-2 text-xs font-black">
                  <Leaf className="h-4 w-4 text-[#75a96b]" /> Shareable recipe
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
