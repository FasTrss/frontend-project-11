/* eslint-disable import/no-extraneous-dependencies */
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import { uniqueId } from 'lodash';
import resources from '../locales/index.js';
import render from './render.js';
import parse from './parser.js';

const getAxiosResponse = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return axios.get(proxyUrl.toString());
};

const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  if (error.isParsingError) {
    return 'notRSS';
  }
  return error.message ?? 'unknown error';
};

const updatePosts = (state) => {
  const update = state.feeds.map((feed) => getAxiosResponse(feed.link))
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      const linksFromState = state.posts
        .filter(({ feedId }) => feedId === feed.id)
        .map((post) => post.link);
      const newPostsWithIds = posts
        .filter(({ link }) => !linksFromState.includes(link))
        .map((post) => ({ ...post, id: uniqueId(), feedId: feed.id }));
      state.posts.unshift(...newPostsWithIds);
    })
    .catch((err) => console.log(err.message));
  Promise.all(update).finally(() => setTimeout(() => updatePosts(state), 5000));
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const initialState = {
        ui: {
          submitDisabled: false,
          readedPosts: new Set(),
          modalWindow: null,
        },
        formStatus: 'filling',
        error: '',
        feeds: [],
        posts: [],
      };

      const elements = {
        form: document.querySelector('form'),
        input: document.getElementById('url-input'),
        submitButton: document.querySelector('button[type="submit"]'),
        feedbackString: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        modalTitle: document.querySelector('.modal-title'),
        modalDescription: document.querySelector('.modal-body'),
        modalLink: document.querySelector('.full-article'),
      };

      const state = onChange(
        initialState,
        render(elements, initialState, i18nInstance),
      );

      yup.setLocale({
        mixed: {
          notOneOf: 'dublicatedURL',
        },
        string: {
          url: 'invalidURL',
        },
      });

      const makeSchema = (feedLinks) => yup.string().url().notOneOf(feedLinks);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        state.ui.submitDisabled = true;
        const addedLinks = state.feeds.map((feed) => feed.link);
        const schema = makeSchema(addedLinks);
        const formData = new FormData(e.target);
        const input = formData.get('url').trim();
        schema
          .validate(input)
          .then(() => {
            state.error = '';
            state.formStatus = 'sending';
            return getAxiosResponse(input);
          })
          .then((response) => {
            const { feed, posts } = parse(response.data.contents);
            feed.link = input;
            feed.id = uniqueId();
            const postsWithIds = posts.map((post) => (
              { ...post, id: uniqueId(), feedId: feed.id }
            ));
            state.feeds.push(feed);
            state.posts.push(...postsWithIds);
            state.formStatus = 'addedURL';
            state.ui.submitDisabled = false;
          })
          .catch((err) => {
            state.error = handleError(err);
            state.formStatus = 'invalidURL';
            console.log(state.error);
            state.ui.submitDisabled = false;
          });
      });
      elements.posts.addEventListener('click', (e) => {
        const targetPostId = e.target.dataset.id;
        state.ui.readedPosts.add(targetPostId);
        state.ui.modalWindow = targetPostId;
      });
      updatePosts(state);
    });
};
