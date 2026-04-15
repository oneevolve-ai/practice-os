"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, MapPin, Star, ExternalLink } from "lucide-react";

interface Contact {
  id: string; name: string; designation: string | null; phone: string | null;
  email: string | null; linkedIn: string | null; instagram: string | null;
  residentCity: string | null; yearsOfExperience: number | null;
  isPrimary: boolean; interests: string | null; birthday: string | null;
  client: { id: string; name: string; industry: string | null; };
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetch(`/api/contacts/${id}`).then(r => r.json()).then(setContact).catch(() => {});
  }, [id]);

  if (!contact) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:text-zinc-700 mb-6 block">← Back</button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900">{contact.name}</h1>
              {contact.isPrimary && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Primary</span>}
            </div>
            {contact.designation && <p className="text-zinc-500">{contact.designation}</p>}
            <button onClick={() => router.push(`/clients/organisations/${contact.client.id}`)} className="text-sm text-blue-600 hover:underline mt-1">{contact.client.name}</button>
          </div>
          {contact.yearsOfExperience && (
            <div className="text-center bg-zinc-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-zinc-900">{contact.yearsOfExperience}</p>
              <p className="text-xs text-zinc-500">yrs exp</p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-700">{contact.phone}</span>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-blue-600">{contact.email}</span>
            </a>
          )}
          {contact.residentCity && (
            <div className="flex items-center gap-3 p-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-700">{contact.residentCity}</span>
            </div>
          )}
          {contact.linkedIn && (
            <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50">
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-blue-600">LinkedIn Profile</span>
            </a>
          )}
        </div>
      </div>

      {/* Interests */}
      {contact.interests && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h2 className="font-semibold text-zinc-900">Interests & Key Activators</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {contact.interests.split(",").map(i => (
              <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">{i.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="font-semibold text-zinc-900 mb-3">Additional Info</h2>
        <div className="space-y-3 text-sm">
          {[
            ["Organisation", contact.client.name],
            ["Industry", contact.client.industry],
            ["Instagram", contact.instagram ? `@${contact.instagram}` : null],
            ["Birthday", contact.birthday ? new Date(contact.birthday).toLocaleDateString("en-IN") : null],
          ].filter(([,v]) => v).map(([label, value]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-zinc-400">{label}</span>
              <span className="text-zinc-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
