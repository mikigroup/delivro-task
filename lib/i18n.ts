import { getLocale, getMessages } from 'next-intl/server';
import { NextRequest } from 'next/server';

export async function getServerLocale() {
  return await getLocale();
}

export async function getServerMessages() {
  return await getMessages();
}

