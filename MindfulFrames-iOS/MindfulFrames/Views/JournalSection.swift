//
//  JournalSection.swift
//  MindfulFrames
//
//  Two reflective journal prompts per pause with autosave.
//

import SwiftUI

struct JournalSection: View {
    let pause: Pause
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Journal", symbol: "square.and.pencil")
            ForEach(Array(pause.journalPrompts.enumerated()), id: \.offset) { index, prompt in
                JournalPromptCard(pause: pause, promptIndex: index, promptText: prompt)
            }
        }
    }
}

struct JournalPromptCard: View {
    let pause: Pause
    let promptIndex: Int
    let promptText: String

    @EnvironmentObject private var store: AppStore
    @State private var text: String = ""
    @FocusState private var focused: Bool
    @State private var didLoad = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(promptText)
                .font(.subheadline.weight(.medium))

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text("Write your reflection…")
                        .font(.body)
                        .foregroundStyle(.tertiary)
                        .padding(.top, 8)
                        .padding(.leading, 4)
                }
                TextEditor(text: $text)
                    .frame(minHeight: 96)
                    .scrollContentBackground(.hidden)
                    .focused($focused)
            }
            .padding(8)
            .background(Theme.canvas, in: RoundedRectangle(cornerRadius: 12, style: .continuous))

            HStack {
                Text("\(text.count) characters")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                Spacer()
                if focused {
                    Button("Done") { focused = false }
                        .font(.caption.weight(.semibold))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .mindfulCard()
        .onAppear {
            guard !didLoad else { return }
            text = store.entry(pauseID: pause.id, promptIndex: promptIndex)?.text ?? ""
            didLoad = true
        }
        .onChange(of: text) { _, newValue in
            guard didLoad else { return }
            store.saveJournal(pauseID: pause.id, promptIndex: promptIndex, promptText: promptText, text: newValue)
        }
    }
}
