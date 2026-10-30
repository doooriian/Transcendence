import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import socket from "../services/socket";
import { getMyProfile } from "../services/users";
import { caseBoard } from "./board";
import type {
  BoardPosition,
  ChessGame,
  ChessMove,
  DraggedPiece,
  PromotionPiece,
} from "./types";

export function useChessGame() {
  const [game, setGame] = useState<ChessGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinGameId, setJoinGameId] = useState("");
  const [botDifficulty, setBotDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [botError, setBotError] = useState(false);
  const [drawResponsePending, setDrawResponsePending] = useState(false);
  const [myAuthId, setMyAuthId] = useState<string | null>(null);

  const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [promotionSquare, setPromotionSquare] = useState<{
    startingSquare: string;
    targetSquare: string;
    pieceColor: "white" | "black";
  } | null>(null);
  const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const myColor: "white" | "black" | null =
    game && myAuthId
      ? game.white === myAuthId
        ? "white"
        : game.black === myAuthId
          ? "black"
          : null
      : null;

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getMyProfile();
        if (result.ok) setMyAuthId(result.data.authId);
      } catch (profileError) {
        console.error(
          "Unable to load the current user's profile:",
          profileError,
        );
      }
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    function resetBoardInteraction() {
      setDraggedPiece(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }

    function updateGame(gameState: ChessGame | null) {
      setDrawResponsePending(false);
      setPromotionSquare(null);
      setGame(gameState);
      resetBoardInteraction();
      setError("");
      setBotError(false);
    }

    function handleGameActive(gameState: ChessGame | null) {
      setGame(gameState);
      resetBoardInteraction();
      setDrawResponsePending(false);
      setBotError(
        Boolean(
          gameState?.bot && gameState.chess.currentPlayerColor === "black",
        ),
      );
    }

    function handleLegalMoves(data: {
      startingSquare: string;
      legalMoves: ChessMove[];
    }) {
      setLegalMoves(data.legalMoves);
    }

    function handleGameError(data: { message: string }) {
      setError(data.message);
      setDraggedPiece(null);
      setDrawResponsePending(false);
    }

    function handleDrawUpdated(gameState: ChessGame) {
      setGame(gameState);
      resetBoardInteraction();
      setPromotionSquare(null);
      setDrawResponsePending(false);
      setError(null);
    }

    function handleBotError(data: { message: string }) {
      setError(data.message);
      setBotError(true);
    }

    function refreshGame() {
      socket.emit("game:get-active");
    }

    socket.on("game:created", updateGame);
    socket.on("game:ready", updateGame);
    socket.on("game:updated", updateGame);
    socket.on("game:ended", updateGame);
    socket.on("game:active", handleGameActive);
    socket.on("game:legal-moves", handleLegalMoves);
    socket.on("game:error", handleGameError);
    socket.on("game:bot-error", handleBotError);
    socket.on("game:draw-updated", handleDrawUpdated);
    socket.on("connect", refreshGame);

    socket.emit("game:get-active");

    return () => {
      socket.off("game:created", updateGame);
      socket.off("game:ready", updateGame);
      socket.off("game:updated", updateGame);
      socket.off("game:ended", updateGame);
      socket.off("game:active", handleGameActive);
      socket.off("game:legal-moves", handleLegalMoves);
      socket.off("game:error", handleGameError);
      socket.off("game:bot-error", handleBotError);
      socket.off("game:draw-updated", handleDrawUpdated);
      socket.off("connect", refreshGame);
    };
  }, []);

  function createGame() {
    setError(null);
    socket.emit("game:create");
  }

  function createBotGame() {
    setError(null);
    setBotError(false);
    socket.emit("game:create", { mode: "bot", difficulty: botDifficulty });
  }

  function joinGame() {
    const gameId = joinGameId.trim();
    const gameIdPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!gameIdPattern.test(gameId)) {
      setError("Invalid game ID");
      return;
    }

    setError(null);
    socket.emit("game:join", gameId);
    setJoinGameId("");
  }

  function cancelGame() {
    if (!game) return;

    socket.emit("game:leave", game.id);
    setGame(null);
    setJoinGameId("");
    setLegalMoves([]);
  }

  function resignGame() {
    if (!game) return;
    socket.emit("game:resign", game.id);
  }

  function offerDraw() {
    if (!game) return;
    setError(null);
    socket.emit("game:offer-draw", { gameId: game.id });
  }

  function respondToDraw(accept: boolean) {
    if (!game || !game.draw.offer || drawResponsePending) return;

    setError(null);
    setDrawResponsePending(true);
    socket.emit("game:respond-draw", {
      gameId: game.id,
      offerId: game.draw.offer.id,
      accept,
    });
  }

  function endGame() {
    if (!game) return;

    setError("");
    setJoinGameId("");
    setLegalMoves([]);
    setGame(null);
  }

  function retryBot() {
    if (!game) return;
    setBotError(false);
    setError(null);
    socket.emit("game:retry-bot", game.id);
  }

  function getEndReasonText(reason: string | null) {
    switch (reason) {
      case "checkmate":
        return "Checkmate";
      case "resignation":
        return "Resignation";
      case "stalemate":
        return "Stalemate";
      case "draw":
        return "Draw";
      case "agreement":
        return "Draw by agreement";
      default:
        return "Game over";
    }
  }

  function getGameResult(result: string | null) {
    if (result === "draw") {
      return "Draw";
    }

    if (result === "whitePlayerWon") {
      return myColor === "white" ? "Victory" : "Defeat";
    }

    if (result === "blackPlayerWon") {
      return myColor === "black" ? "Victory" : "Defeat";
    }

    return "Game over";
  }

  function getBackendCoordinates(row: number, col: number): BoardPosition {
    if (myColor === "black") return { row: 7 - row, col: 7 - col };
    return { row, col };
  }

  function handleSquareClick(row: number, col: number) {
    if (
      !game ||
      !myColor ||
      game.chess.isGameFinished ||
      game.draw.offer !== null ||
      game.chess.currentPlayerColor !== myColor ||
      !game.black
    ) {
      return;
    }

    const { row: backendRow, col: backendCol } = getBackendCoordinates(
      row,
      col,
    );
    const piece = game.chess.chessBoard[backendRow][backendCol];
    const square = displayedCaseBoard[row][col];

    if (selectedSquare) {
      const { row: startBackendRow, col: startBackendCol } =
        getBackendCoordinates(selectedSquare.row, selectedSquare.col);
      const startingSquare = caseBoard[startBackendRow][startBackendCol];
      const moveIsLegal = legalMoves.some(
        (move) => move.targetSquare === square,
      );

      if (moveIsLegal) {
        const selectedPiece =
          game.chess.chessBoard[startBackendRow][startBackendCol];
        const isPromotion =
          selectedPiece?.chessPieceType === "pawn" &&
          ((selectedPiece.chessPieceColor === "white" && square[1] === "8") ||
            (selectedPiece.chessPieceColor === "black" && square[1] === "1"));

        if (isPromotion && selectedPiece) {
          setPromotionSquare({
            startingSquare,
            targetSquare: square,
            pieceColor: selectedPiece.chessPieceColor,
          });
        } else {
          socket.emit("game:move", {
            gameId: game.id,
            move: { startingSquare, targetSquare: square },
          });
        }

        setSelectedSquare(null);
        setLegalMoves([]);
        setDraggedPiece(null);
        return;
      }
    }

    if (piece && piece.chessPieceColor === myColor) {
      setSelectedSquare({ row, col });
      socket.emit("game:get-legal-moves", {
        gameId: game.id,
        startingSquare: square,
      });
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    row: number,
    col: number,
  ) {
    if (!game) return;

    const { row: backendRow, col: backendCol } = getBackendCoordinates(
      row,
      col,
    );
    const piece = game.chess.chessBoard[backendRow][backendCol];

    if (
      game.chess.isGameFinished ||
      !game.black ||
      game.draw.offer !== null ||
      game.chess.currentPlayerColor !== myColor ||
      piece?.chessPieceColor !== myColor
    ) {
      return;
    }

    if (!piece) return;

    event.preventDefault();
    const startingSquare = caseBoard[backendRow][backendCol];

    socket.emit("game:get-legal-moves", {
      gameId: game.id,
      startingSquare,
    });

    setDraggedPiece({ row, col, piece });
    setMousePosition({ x: event.clientX, y: event.clientY });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggedPiece) return;
    setMousePosition({ x: event.clientX, y: event.clientY });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggedPiece || !game || game.draw.offer !== null) return;

    const boardElement = event.currentTarget;
    const rect = boardElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
      setDraggedPiece(null);
      setLegalMoves([]);
      return;
    }

    const squareWidth = rect.width / 8;
    const squareHeight = rect.height / 8;
    const targetCol = Math.floor(x / squareWidth);
    const targetRow = Math.floor(y / squareHeight);

    const { row: startBackendRow, col: startBackendCol } =
      getBackendCoordinates(draggedPiece.row, draggedPiece.col);
    const startingSquare = caseBoard[startBackendRow][startBackendCol];

    const { row: targetBackendRow, col: targetBackendCol } =
      getBackendCoordinates(targetRow, targetCol);
    const targetSquare = caseBoard[targetBackendRow][targetBackendCol];
    const moveIsLegal = legalMoves.some(
      (move) => move.targetSquare === targetSquare,
    );

    if (!moveIsLegal) {
      setDraggedPiece(null);
      setLegalMoves([]);
      return;
    }

    const piece = draggedPiece.piece;
    const isPromotion =
      piece?.chessPieceType === "pawn" &&
      ((piece.chessPieceColor === "white" && targetSquare[1] === "8") ||
        (piece.chessPieceColor === "black" && targetSquare[1] === "1"));

    if (isPromotion && piece) {
      setPromotionSquare({
        startingSquare,
        targetSquare,
        pieceColor: piece.chessPieceColor,
      });
      setDraggedPiece(null);
      setLegalMoves([]);
      return;
    }

    socket.emit("game:move", {
      gameId: game.id,
      move: { startingSquare, targetSquare },
    });

    setDraggedPiece(null);
    setLegalMoves([]);
  }

  function promote(pieceType: PromotionPiece) {
    if (!promotionSquare || !game) return;

    socket.emit("game:move", {
      gameId: game.id,
      move: {
        startingSquare: promotionSquare.startingSquare,
        targetSquare: promotionSquare.targetSquare,
        promotionChessPieceType: pieceType,
      },
    });

    setPromotionSquare(null);
  }

  const displayedBoard =
    myColor === "black"
      ? [...(game?.chess.chessBoard ?? [])]
          .reverse()
          .map((row) => [...row].reverse())
      : (game?.chess.chessBoard ?? []);

  const displayedCaseBoard =
    myColor === "black"
      ? [...caseBoard].reverse().map((row) => [...row].reverse())
      : caseBoard;

  const mySideColor =
    myColor === "white" || myColor === "black" ? myColor : null;
  const hisSideColor: "white" | "black" | null =
    mySideColor === "white"
      ? "black"
      : mySideColor === "black"
        ? "white"
        : null;

  const searchingGame =
    game && !game.chess.isGameFinished && game.black === null ? game : null;

  let receivedDrawOffer: ChessGame["draw"]["offer"] = null;
  let drawOffersMade = 0;
  if (game && myColor) {
    drawOffersMade = game.draw.offersMade[myColor];
    if (
      !game.chess.isGameFinished &&
      game.draw.offer !== null &&
      game.draw.offer.offeredBy !== myAuthId
    ) {
      receivedDrawOffer = game.draw.offer;
    }
  }

  const drawButtonColors =
    drawOffersMade >= 3
      ? "from-gray-500 to-gray-600"
      : "from-cyan-900 to-teal-500 hover:from-emerald-600 hover:to-green-400";

  return {
    game,
    error,
    setError,
    joinGameId,
    setJoinGameId,
    botDifficulty,
    setBotDifficulty,
    botError,
    drawResponsePending,
    myAuthId,
    myColor,
    draggedPiece,
    selectedSquare,
    promotionSquare,
    legalMoves,
    mousePosition,
    displayedBoard,
    displayedCaseBoard,
    mySideColor,
    hisSideColor,
    searchingGame,
    receivedDrawOffer,
    drawOffersMade,
    drawButtonColors,
    createGame,
    createBotGame,
    joinGame,
    cancelGame,
    resignGame,
    offerDraw,
    respondToDraw,
    endGame,
    retryBot,
    getEndReasonText,
    getGameResult,
    handleSquareClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    promote,
  };
}
