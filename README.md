# WikiTree MCP server

This project provides an MCP server that integrates with the [WikiTree API](https://www.wikitree.com/) and exposes it as a set of tools.

Disclaimer: This code (and readme) was fully vibe-coded and I am not planning to continue developing it. I have tested it in [Gemini CLI](https://developers.google.com/gemini/cli). Maybe it could also work in other apps that support the MCP protocol. Feel free to take the code and use it any way you like.


## Backstory

This entire project was implemented by the Gemini CLI itself. Starting with a single prompt, Gemini was asked to create a tool server for the WikiTree API. It wrote the server code, defined the tools, and handled the integration with the Model Context Protocol (MCP) server. This README (the majority of it), and the entire interaction history, serves as a testament to its capabilities.

## Usage Instructions

### 1. Installation

First, install the necessary dependencies:

```bash
npm install
```

### 2. Build the Project

The server is written in TypeScript. Compile it to JavaScript:

```bash
npm run build
```

### 3. Run the Server

Start the MCP tool server:

```bash
npm start -- --sse --port=3000
```

### 4. Connect Gemini CLI

Add the following settings to `~/.gemini/settings.json`:

```json
"mcpServers": {
  "wikitree": {
    "url": "http://localhost:3000/sse"
  }
}
```

You can now run Gemini CLI and questions related to WikiTree.

## Example Questions and Answers

Here are the example interactions that were used to generate the information about Maria Skłodowska-Curie and her family.

### Get Parents

**Question:**
> get parents of Skłodowska-2

**Answer:**
> The parents of Maria Salomea (Skłodowska) Curie (Skłodowska-2) are:
> *   **Father:** Władysław Skłodowski (Skłodowski-1), born in 1832 and died in 1902.
> *   **Mother:** Bronisława Marianna (Boguska) Skłodowska (Boguska-1), born in 1835 and died in 1878.

### Get Grandparents

**Question:**
> wWhat are the names of grandparents of Maria Skłodowska?

**Answer:**
> The grandparents of Maria Salomea (Skłodowska) Curie are:
>
> **Paternal Grandparents (Parents of Władysław Skłodowski):**
> *   **Grandfather:** Józef Skłodowski (Skłodowski-4), 1804–1882.
> *   **Grandmother:** Salomea (Sagtyńska) Skłodowska (Sagtyńska-1), 1802–1882.
>
> **Maternal Grandparents (Parents of Bronisława Marianna Boguska):**
> *   **Grandfather:** Feliks Boguski (Boguski-1), 1799–1872.
> *   **Grandmother:** Marianna Zaruska (Zaruska-1).

### Get Biography

**Question:**
> short bio of Maria

**Answer:**
> **Maria Salomea (Skłodowska) Curie** (1867–1934) was a pioneering Polish-French physicist and chemist. She is best known for her groundbreaking research on radioactivity, a term she coined.
>
> **Key Achievements:**
> *   **Nobel Prizes:** She was the first woman to win a Nobel Prize and remains the only person to win Nobel Prizes in two different scientific fields (Physics in 1903 and Chemistry in 1911).
> *   **Element Discovery:** Along with her husband Pierre Curie, she discovered the elements **polonium** (named after her native Poland) and **radium**.
> *   **Educational Pioneer:** She was the first female professor at the University of Paris (Sorbonne).
> *   **War Effort:** During World War I, she developed mobile X-ray units ("Little Curies") to assist battlefield surgeons.
>
> **Personal Life:** Born in Warsaw, Poland, she moved to Paris in 1891 to study. She married Pierre Curie in 1895, and they had two daughters, Irène (also a Nobel laureate) and Ève. She died in 1934 from leukemia, caused by her long-term exposure to radiation. She is buried in the Panthéon in Paris.

### Ancestors' Achievements

**Question:**
> Are her ancestors known for something?

**Answer:**
> Maria Skłodowska-Curie's ancestors were largely part of the Polish intelligentsia and minor nobility (szlachta), many of whom were dedicated educators and patriots.
>
> **Parents:**
> *   **Father: Władysław Skłodowski (1832–1902)** was a well-known teacher of mathematics and physics and the director of two gymnasiums (secondary schools) for boys in Warsaw.
> *   **Mother: Bronisława Boguska (1835–1878)** was also an educator. She was the director of a prestigious Warsaw boarding school for girls until she contracted tuberculosis.
>
> **Grandparents:**
> *   **Paternal Grandfather: Józef Skłodowski (1804–1882)** was a prominent educator, librarian, and school principal. He was also a participant in the **November Uprising (1830–1831)**, a Polish insurrection against the Russian Empire.
>
> **Family Heritage:**
> *   Both the Skłodowski and Boguski families belonged to the Polish nobility, though they had lost most of their property and focused their efforts on intellectual pursuits.

### Descendants' Achievements

**Question:**
> What about her descendants?

**Answer:**
> Maria Skłodowska-Curie had two daughters, both of whom were highly accomplished:
>
> **Daughters:**
> 1.  **Irène Joliot-Curie (1897–1956):** A Nobel Prize-winning scientist. She and her husband, Frédéric Joliot-Curie, were awarded the **Nobel Prize in Chemistry in 1935** for their discovery of artificial radioactivity.
> 2.  **Ève Curie (1904–2007):** A successful writer, journalist, and concert pianist, famous for writing her mother's biography, *Madame Curie*. She later worked extensively with UNICEF.
>
> **Grandchildren (Children of Irène):**
> *   **Hélène Langevin-Joliot (born 1927):** A distinguished nuclear physicist.
> *   **Pierre Joliot (born 1932):** A renowned biologist and researcher.
>
> Maria's descendants have continued her legacy of scientific and humanitarian excellence.
