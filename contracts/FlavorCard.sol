// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FlavorCard {
    uint256 public nextCardId = 1;

    struct Card {
        address cook;
        string title;
        string flavor;
        string ingredients;
        string steps;
        string servingNote;
        uint256 createdAt;
    }

    mapping(uint256 => Card) private cards;

    event CardCreated(
        uint256 indexed cardId,
        address indexed cook,
        string title,
        string flavor
    );

    function createCard(
        string calldata title,
        string calldata flavor,
        string calldata ingredients,
        string calldata steps,
        string calldata servingNote
    ) external returns (uint256 cardId) {
        require(bytes(title).length > 0 && bytes(title).length <= 36, "Invalid title");
        require(bytes(flavor).length > 0 && bytes(flavor).length <= 18, "Invalid flavor");
        require(bytes(ingredients).length > 0 && bytes(ingredients).length <= 180, "Invalid ingredients");
        require(bytes(steps).length > 0 && bytes(steps).length <= 220, "Invalid steps");
        require(bytes(servingNote).length <= 90, "Invalid note");

        cardId = nextCardId++;
        cards[cardId] = Card({
            cook: msg.sender,
            title: title,
            flavor: flavor,
            ingredients: ingredients,
            steps: steps,
            servingNote: servingNote,
            createdAt: block.timestamp
        });

        emit CardCreated(cardId, msg.sender, title, flavor);
    }

    function getCard(
        uint256 cardId
    )
        external
        view
        returns (
            address cook,
            string memory title,
            string memory flavor,
            string memory ingredients,
            string memory steps,
            string memory servingNote,
            uint256 createdAt
        )
    {
        Card storage card = cards[cardId];
        return (
            card.cook,
            card.title,
            card.flavor,
            card.ingredients,
            card.steps,
            card.servingNote,
            card.createdAt
        );
    }
}
