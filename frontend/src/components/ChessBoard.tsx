import { getPieceImage } from "../utils/pieces";
import type {
  BoardPosition,
  ChessGame,
  ChessMove,
  ChessPiece,
  DraggedPiece,
  PieceImages,
} from "../utils/types";
import type { PointerEvent as ReactPointerEvent } from "react";

type ChessBoardProps = {
  game: ChessGame;
  board: ChessPiece[][];
  caseBoard: string[][];
  borderThemeClass: string;
  whiteCaseClass: string;
  darkCaseClass: string;
  pieceImages: PieceImages;
  legalMoves: ChessMove[];
  draggedPiece: DraggedPiece | null;
  selectedSquare: BoardPosition | null;
  mousePosition: { x: number; y: number };
  onSquareClick: (row: number, col: number) => void;
  onPointerDown: (
    event: ReactPointerEvent<HTMLDivElement>,
    row: number,
    col: number,
  ) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

const SQUARE_HIGHLIGHT_STYLES = {
  emerald: {
    strong: "bg-emerald-400/40 ring-4 ring-inset ring-emerald-300",
  },
  red: {
    strong: "bg-red-500/40 ring-4 ring-inset ring-red-500",
  },
  amber: {
    strong: "bg-amber-300/40 ring-4 ring-inset ring-amber-300",
    light: "bg-amber-200/20 ring-4 ring-inset ring-amber-300/40",
  },
} as const;

function SquareHighlight({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} />
  );
}

export default function ChessBoard({
  game,
  board,
  caseBoard,
  borderThemeClass,
  whiteCaseClass,
  darkCaseClass,
  pieceImages,
  legalMoves,
  draggedPiece,
  selectedSquare,
  mousePosition,
  onSquareClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ChessBoardProps) {
  const lastMove =
    game.chess.moveHistory.length > 0
      ? game.chess.moveHistory[game.chess.moveHistory.length - 1]
      : null;

  return (
    <div
      className={`grid aspect-square w-full touch-none grid-cols-8 grid-rows-8 overflow-hidden rounded-lg shadow-2xl ring-2 ring-purple-500/20 sm:rounded-2xl sm:ring-4 ${borderThemeClass}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {board.map((row, rowIndex) =>
        row.map((piece, columnIndex) => {
          const pieceImage = getPieceImage(piece, pieceImages);
          const isDark = (rowIndex + columnIndex) % 2 === 1;
          const square = caseBoard[rowIndex][columnIndex];

          const isDragging =
            draggedPiece?.row === rowIndex && draggedPiece?.col === columnIndex;

          const isSelected =
            selectedSquare?.row === rowIndex &&
            selectedSquare?.col === columnIndex;

          const isKingInCheck =
            game.chess.isCurrentPlayerInCheck &&
            piece?.chessPieceType === "king" &&
            piece.chessPieceColor === game.chess.currentPlayerColor;

          const isLegalMove = legalMoves.some(
            (move) => move.targetSquare === square,
          );

          const isLastMoveOrigin = lastMove?.startingSquare === square;

          const isLastMoveDestination = lastMove?.targetSquare === square;

          return (
            <div
              key={`${rowIndex}-${columnIndex}`}
              onClick={() => onSquareClick(rowIndex, columnIndex)}
              onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) =>
                onPointerDown(event, rowIndex, columnIndex)
              }
              className={`relative flex aspect-square touch-none cursor-grab select-none items-center justify-center transition-all ${
                isDragging ? "scale-105 opacity-30" : ""
              } ${isDark ? darkCaseClass : whiteCaseClass}`}
            >
              {isLastMoveOrigin && (
                <SquareHighlight
                  className={SQUARE_HIGHLIGHT_STYLES.amber.light}
                />
              )}

              {isLastMoveDestination && (
                <SquareHighlight
                  className={SQUARE_HIGHLIGHT_STYLES.amber.strong}
                />
              )}

              {isLegalMove && (
                <SquareHighlight
                  className={SQUARE_HIGHLIGHT_STYLES.emerald.strong}
                />
              )}

              {isSelected && (
                <SquareHighlight
                  className={SQUARE_HIGHLIGHT_STYLES.emerald.strong}
                />
              )}

              {isKingInCheck && (
                <SquareHighlight
                  className={SQUARE_HIGHLIGHT_STYLES.red.strong}
                />
              )}

              {pieceImage && (
                <img
                  src={pieceImage}
                  alt=""
                  draggable={false}
                  className="pointer-events-none relative z-10 h-[114%] w-[114%] object-contain drop-shadow-lg"
                />
              )}
            </div>
          );
        }),
      )}

      {draggedPiece && (
        <img
          src={getPieceImage(draggedPiece.piece, pieceImages)}
          alt=""
          draggable={false}
          className="pointer-events-none fixed z-50 h-16 w-16 object-contain drop-shadow-2xl sm:h-24 sm:w-24"
          style={{
            left: mousePosition.x - 32,
            top: mousePosition.y - 32,
          }}
        />
      )}
    </div>
  );
}
