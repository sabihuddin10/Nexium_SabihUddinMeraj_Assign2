import sys
from deep_translator import GoogleTranslator

def main():
    if len(sys.argv) < 4:
        print("ERROR: Not enough arguments", file=sys.stderr)
        sys.exit(1)

    from_lang = sys.argv[1]
    to_lang = sys.argv[2]
    text = sys.argv[3]

    try:
        translated = GoogleTranslator(source=from_lang, target=to_lang).translate(text)
        print(translated.encode("utf-8").decode("utf-8"))  # Force UTF-8 output
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
